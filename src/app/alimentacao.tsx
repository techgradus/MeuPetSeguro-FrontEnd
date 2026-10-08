import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PhoneFrame from '@/components/PhoneFrame';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { isPetId, pets } from '@/data/pets';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';

/* ============================================================
   DADOS MOCK
   O nível (%) vem de data/pets.ts. O restante (média, gráfico e
   histórico) é mock: troque por dados reais quando houver API.
============================================================ */

type Kind = 'food' | 'water';

type HistoryItem = {
  title: string;
  time: string;
  amount: string;
};

type KindInfo = {
  tabLabel: string;
  chartTitle: string;
  average: string;
  color: string; // barras do gráfico e líquido do pote
  softColor: string; // fundo dos ícones
  headerIcon: keyof typeof Ionicons.glyphMap;
  okText: string;
  /** Valores de 0 a 100, de segunda a domingo */
  bars: number[];
  history: HistoryItem[];
};

const KINDS: Record<Kind, KindInfo> = {
  food: {
    tabLabel: 'Comida',
    chartTitle: 'Consumo diário',
    average: 'média 320 g',
    color: '#DD9528',
    softColor: '#FFE9CC',
    headerIcon: 'restaurant-outline',
    okText: 'Há comida suficiente até amanhã de manhã.',
    bars: [85, 61, 100, 73, 91, 77, 85],
    history: [
      { title: 'Consumo registrado', time: 'Hoje, 08:14', amount: '112 g' },
      { title: 'Pote utilizado', time: 'Ontem, 19:32', amount: '98 g' },
      { title: 'Pote utilizado', time: 'Ontem, 12:08', amount: '106 g' },
    ],
  },
  water: {
    tabLabel: 'Água',
    chartTitle: 'Hidratação diária',
    average: 'média 680 ml',
    color: '#3A94C9',
    softColor: '#D6EEFB',
    headerIcon: 'water-outline',
    okText: 'Há água suficiente até amanhã de manhã.',
    bars: [70, 88, 55, 100, 82, 91, 52],
    history: [
      { title: 'Consumo registrado', time: 'Hoje, 08:14', amount: '210 ml' },
      { title: 'Pote utilizado', time: 'Ontem, 19:32', amount: '184 ml' },
      { title: 'Pote utilizado', time: 'Ontem, 12:08', amount: '226 ml' },
    ],
  },
};

const KIND_ORDER: Kind[] = ['food', 'water'];
const WEEK_AXIS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Abaixo deste nível o pote é considerado "BAIXO" (igual à Home)
const LOW_THRESHOLD = 60;
const LOW_TEXT = 'O pote pode ficar vazio nas próximas 3 horas.';

/* ============================================================
   TELA
============================================================ */

export default function FeedingScreen() {
  const router = useRouter();
  const { pet: petParam, tab: tabParam } = useLocalSearchParams<{
    pet?: string;
    tab?: string;
  }>();

  // Recebe da Home: /alimentacao?pet=Mia&tab=water
  const petId = isPetId(petParam) ? petParam : 'Rex';
  const pet = pets[petId];

  const [kind, setKind] = useState<Kind>(tabParam === 'water' ? 'water' : 'food');
  const info = KINDS[kind];

  const percent = kind === 'food' ? pet.food : pet.water;
  const low = percent < LOW_THRESHOLD;

  const layout = useLayout();
  const { s } = layout;

  const styles = useMemo(
    () => makeStyles(layout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      layout.frameWidth,
      layout.frameHeight,
      layout.insetTop,
      layout.insetBottom,
      layout.isWeb,
    ],
  );

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  }

  return (
    <PhoneFrame active="home">
      {/* Esconde o cabeçalho nativo; a tela tem o próprio */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* CABEÇALHO */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Ionicons name="chevron-back" size={s(22)} color={colors.text} />
            </Pressable>

            <Text style={styles.headerTitle}>Alimentação</Text>

            {/* espaço do mesmo tamanho do botão, para centralizar o título */}
            <View style={styles.backButtonSpacer} />
          </View>

          {/* COMIDA / ÁGUA */}
          <View style={styles.segmented}>
            {KIND_ORDER.map((key) => {
              const selected = key === kind;

              return (
                <Pressable
                  key={key}
                  style={[styles.segment, selected && styles.segmentSelected]}
                  onPress={() => setKind(key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selected && styles.segmentTextSelected,
                    ]}
                  >
                    {KINDS[key].tabLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* NÍVEL ATUAL */}
          <View style={styles.levelCard}>
            <View style={styles.levelInfo}>
              <View
                style={[styles.levelIcon, { backgroundColor: info.softColor }]}
              >
                <Ionicons
                  name={info.headerIcon}
                  size={s(20)}
                  color={info.color}
                />
              </View>

              <Text style={styles.levelLabel}>Nível atual · {pet.name}</Text>

              <Text style={styles.levelValue}>
                {percent}
                <Text style={styles.levelPercent}>%</Text>
              </Text>

              <Text style={styles.levelUpdated}>Atualizado há 2 minutos</Text>
            </View>

            <View
              style={styles.tank}
              accessibilityRole="progressbar"
              accessibilityLabel={`Nível de ${info.tabLabel.toLowerCase()}`}
              accessibilityValue={{ min: 0, max: 100, now: percent }}
            >
              <View style={styles.tankInner}>
                <View
                  style={[
                    styles.tankFill,
                    { height: `${percent}%`, backgroundColor: info.color },
                  ]}
                />
              </View>

              <Text style={styles.tankLabel}>{low ? 'BAIXO' : 'OK'}</Text>
            </View>
          </View>

          {/* AVISO */}
          <View style={styles.banner}>
            <Ionicons
              name="shield-checkmark-outline"
              size={s(20)}
              color={colors.primary}
            />

            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                {low ? 'Reposição recomendada' : 'Nível confortável'}
              </Text>
              <Text style={styles.bannerText}>
                {low ? LOW_TEXT : info.okText}
              </Text>
            </View>
          </View>

          {/* GRÁFICO */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartCaption}>Últimos 7 dias</Text>
              <Text style={styles.chartCaption}>{info.average}</Text>
            </View>

            <Text style={styles.chartTitle}>{info.chartTitle}</Text>

            <View style={styles.chartArea}>
              <View style={[styles.gridLine, { top: 0 }]} />
              <View style={[styles.gridLine, { top: '50%' }]} />

              <View style={styles.bars}>
                {info.bars.map((value, index) => (
                  <View
                    key={WEEK_AXIS[index]}
                    style={[
                      styles.bar,
                      { height: `${value}%`, backgroundColor: info.color },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.axis}>
              {WEEK_AXIS.map((label) => (
                <Text key={label} style={styles.axisLabel}>
                  {label}
                </Text>
              ))}
            </View>
          </View>

          {/* HISTÓRICO */}
          <Text style={styles.sectionTitle}>Histórico recente</Text>

          <View style={styles.historyCard}>
            {info.history.map((item, index) => (
              <View
                key={`${item.title}-${item.time}`}
                style={[
                  styles.historyRow,
                  index > 0 && styles.historyRowDivider,
                ]}
              >
                <View
                  style={[
                    styles.historyIcon,
                    { backgroundColor: info.softColor },
                  ]}
                >
                  {kind === 'food' ? (
                    <MaterialCommunityIcons
                      name="bone"
                      size={s(18)}
                      color={info.color}
                    />
                  ) : (
                    <Ionicons
                      name="water-outline"
                      size={s(18)}
                      color={info.color}
                    />
                  )}
                </View>

                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyTime}>{item.time}</Text>
                </View>

                <Text style={styles.historyAmount}>{item.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}

/* ============================================================
   ESTILOS (dependem do tamanho da tela)
============================================================ */

function makeStyles({ s, isWeb, insetTop, navHeight }: Layout) {
  const border = '#D2E8E3';
  const divider = '#E3ECEA';

  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: s(24),
      paddingTop: isWeb ? s(24) : insetTop + s(14),
      paddingBottom: navHeight + s(24),
    },

    content: {
      width: '100%',
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center',
    },

    /* CABEÇALHO */

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    backButton: {
      width: s(44),
      height: s(44),
      borderRadius: s(12),
      backgroundColor: ui.card,
      borderWidth: 1,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    backButtonSpacer: {
      width: s(44),
      height: s(44),
    },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: fonts.extrabold,
      fontSize: s(22),
      color: ui.strong,
    },

    /* COMIDA / ÁGUA */

    segmented: {
      marginTop: s(16),
      flexDirection: 'row',
      backgroundColor: '#E4ECEB',
      borderRadius: s(12),
      padding: s(4),
    },

    segment: {
      flex: 1,
      height: s(40),
      borderRadius: s(10),
      alignItems: 'center',
      justifyContent: 'center',
    },

    segmentSelected: {
      backgroundColor: ui.card,
      borderWidth: 1,
      borderColor: ui.cardBorder,
    },

    segmentText: {
      fontFamily: fonts.medium,
      fontSize: s(13),
      color: ui.muted,
    },

    segmentTextSelected: {
      fontFamily: fonts.extrabold,
      color: colors.primary,
    },

    /* NÍVEL ATUAL */

    levelCard: {
      marginTop: s(14),
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      padding: s(16),
      flexDirection: 'row',
      alignItems: 'center',
    },

    levelInfo: {
      flex: 1,
    },

    levelIcon: {
      width: s(36),
      height: s(36),
      borderRadius: s(10),
      alignItems: 'center',
      justifyContent: 'center',
    },

    levelLabel: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: ui.muted,
      marginTop: s(10),
    },

    levelValue: {
      fontFamily: fonts.extrabold,
      fontSize: s(40),
      lineHeight: s(46),
      color: colors.text,
    },

    levelPercent: {
      fontFamily: fonts.bold,
      fontSize: s(22),
    },

    levelUpdated: {
      fontFamily: fonts.medium,
      fontSize: s(10),
      color: ui.muted,
      marginTop: s(2),
    },

    tank: {
      width: s(78),
      height: s(104),
      borderRadius: s(18),
      borderWidth: s(4),
      borderColor: '#D6DDDB',
      backgroundColor: '#F4F4E6',
      padding: s(5),
      marginLeft: s(12),
    },

    tankInner: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    tankFill: {
      width: '100%',
      borderRadius: s(12),
    },

    tankLabel: {
      position: 'absolute',
      top: '34%',
      left: 0,
      right: 0,
      textAlign: 'center',
      fontFamily: fonts.extrabold,
      fontSize: s(10),
      color: ui.strong,
    },

    /* AVISO */

    banner: {
      marginTop: s(14),
      backgroundColor: ui.tealSoft,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: ui.cardBorder,
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      flexDirection: 'row',
      alignItems: 'center',
    },

    bannerContent: {
      flex: 1,
      marginLeft: s(12),
    },

    bannerTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(12),
      color: colors.primary,
    },

    bannerText: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: colors.text,
      marginTop: 1,
    },

    /* GRÁFICO */

    chartCard: {
      marginTop: s(14),
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      padding: s(16),
    },

    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    chartCaption: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
    },

    chartTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(16),
      color: colors.text,
      marginTop: s(2),
    },

    chartArea: {
      height: s(104),
      marginTop: s(16),
    },

    gridLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: divider,
    },

    bars: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: s(8),
      borderBottomWidth: 1,
      borderBottomColor: divider,
    },

    bar: {
      flex: 1,
      borderTopLeftRadius: s(4),
      borderTopRightRadius: s(4),
    },

    axis: {
      flexDirection: 'row',
      gap: s(8),
      marginTop: s(6),
    },

    axisLabel: {
      flex: 1,
      textAlign: 'center',
      fontFamily: fonts.medium,
      fontSize: s(10),
      color: ui.muted,
    },

    /* HISTÓRICO */

    sectionTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(18),
      color: ui.strong,
      marginTop: s(22),
      marginBottom: s(6),
    },

    historyCard: {
      borderBottomWidth: 1,
      borderBottomColor: divider,
    },

    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(12),
    },

    historyRowDivider: {
      borderTopWidth: 1,
      borderTopColor: divider,
    },

    historyIcon: {
      width: s(38),
      height: s(38),
      borderRadius: s(10),
      alignItems: 'center',
      justifyContent: 'center',
    },

    historyInfo: {
      flex: 1,
      marginLeft: s(12),
    },

    historyTitle: {
      fontFamily: fonts.bold,
      fontSize: s(13),
      color: colors.text,
    },

    historyTime: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: 1,
    },

    historyAmount: {
      fontFamily: fonts.extrabold,
      fontSize: s(13),
      color: colors.text,
    },
  });
}

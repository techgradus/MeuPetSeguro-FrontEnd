import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PetAvatar from '@/components/PetAvatar';
import PhoneFrame from '@/components/PhoneFrame';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { isPetId, PetId, pets } from '@/data/pets';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';

/* ============================================================
   DADOS MOCK DA ATIVIDADE
   Quando existir API, troque por dados reais do pet.
============================================================ */

type Period = 'today' | 'week';

type Bar = {
  /** Altura relativa, de 0 a 100 */
  value: number;
  /** Barra escura (destaque) */
  intense?: boolean;
};

type Stat = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  hint: string;
};

type PeriodData = {
  activeTime: string;
  variation: string;
  bars: Bar[];
  axis: string[];
  summaryTitle: string;
  stats: Stat[];
};

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  week: '7 dias',
};

const todayBars: Bar[] = [
  { value: 26, intense: true },
  { value: 18 },
  { value: 36 },
  { value: 46, intense: true },
  { value: 82 },
  { value: 67 },
  { value: 98, intense: true },
  { value: 77 },
  { value: 52 },
  { value: 34, intense: true },
  { value: 21 },
  { value: 38 },
];

const weekBars: Bar[] = [
  { value: 50 },
  { value: 70, intense: true },
  { value: 55 },
  { value: 98 },
  { value: 74, intense: true },
  { value: 34 },
  { value: 88 },
];

const todayAxis = ['00h', '06h', '12h', '18h', '24h'];
const weekAxis = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const todayStats: Stat[] = [
  { label: 'Passos', icon: 'paw-outline', value: '4.821', hint: 'Meta: 6.000' },
  {
    label: 'Distância',
    icon: 'speedometer-outline',
    value: '3,2 km',
    hint: '+0,4 km',
  },
  {
    label: 'Repouso',
    icon: 'pulse-outline',
    value: '5h 42m',
    hint: 'Dentro do normal',
  },
  {
    label: 'Pico ativo',
    icon: 'sparkles-outline',
    value: '11:40',
    hint: '32 minutos',
  },
];

const weekStats: Stat[] = [
  { label: 'Passos', icon: 'paw-outline', value: '33.747', hint: 'Meta: 42.000' },
  {
    label: 'Distância',
    icon: 'speedometer-outline',
    value: '22,4 km',
    hint: '+2,1 km',
  },
  {
    label: 'Repouso',
    icon: 'pulse-outline',
    value: '39h 54m',
    hint: 'Dentro do normal',
  },
  {
    label: 'Pico ativo',
    icon: 'sparkles-outline',
    value: '11:40',
    hint: 'Qui · 32 minutos',
  },
];

const activityByPet: Record<PetId, Record<Period, PeriodData>> = {
  Rex: {
    today: {
      activeTime: '2h 34min',
      variation: '+12%',
      bars: todayBars,
      axis: todayAxis,
      summaryTitle: 'Resumo de hoje',
      stats: todayStats,
    },
    week: {
      activeTime: '16h 20min',
      variation: '+12%',
      bars: weekBars,
      axis: weekAxis,
      summaryTitle: 'Resumo dos 7 dias',
      stats: weekStats,
    },
  },
  Mia: {
    today: {
      activeTime: '3h 12min',
      variation: '+8%',
      bars: todayBars,
      axis: todayAxis,
      summaryTitle: 'Resumo de hoje',
      stats: todayStats,
    },
    week: {
      activeTime: '21h 08min',
      variation: '+8%',
      bars: weekBars,
      axis: weekAxis,
      summaryTitle: 'Resumo dos 7 dias',
      stats: weekStats,
    },
  },
};

type ActivityEvent = {
  title: string;
  time: string;
  kind: 'intense' | 'rest';
  duration: string;
};

const events: ActivityEvent[] = [
  {
    title: 'Passeio matinal',
    time: '08:12 · atividade intensa',
    kind: 'intense',
    duration: '34 min',
  },
  {
    title: 'Período de descanso',
    time: '09:03 · repouso',
    kind: 'rest',
    duration: '1h 18m',
  },
];

/* ============================================================
   TELA
============================================================ */

export default function ActivityScreen() {
  const router = useRouter();
  const { pet: petParam } = useLocalSearchParams<{ pet?: string }>();

  // Recebe o pet da Home (/activity?pet=Mia). Sem parâmetro, usa o Rex.
  const petId: PetId = isPetId(petParam) ? petParam : 'Rex';
  const pet = pets[petId];

  const [period, setPeriod] = useState<Period>('today');
  const data = activityByPet[petId][period];

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

  // Divide os 4 cards de resumo em duas linhas de 2
  const statRows = [data.stats.slice(0, 2), data.stats.slice(2, 4)];

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
              style={styles.iconButton}
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Ionicons name="chevron-back" size={s(22)} color={colors.text} />
            </Pressable>

            <Text style={styles.headerTitle}>Atividade</Text>

            <Pressable
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Filtros"
              // TODO: abrir filtros de atividade
              onPress={() => {}}
            >
              <Ionicons
                name="options-outline"
                size={s(22)}
                color={colors.text}
              />
            </Pressable>
          </View>

          {/* PET */}
          <View style={styles.petCard}>
            <PetAvatar
              pet={pet}
              size={s(40)}
              radius={s(8)}
              emojiSize={s(22)}
            />

            <View style={styles.petInfo}>
              <Text style={styles.petName} numberOfLines={1}>
                {pet.name}
              </Text>
              <Text style={styles.petBreed} numberOfLines={1}>
                {pet.breed}
              </Text>
            </View>

            {pet.online && (
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineText}>Online</Text>
              </View>
            )}
          </View>

          {/* HOJE / 7 DIAS */}
          <View style={styles.segmented}>
            {(Object.keys(PERIOD_LABELS) as Period[]).map((key) => {
              const selected = key === period;

              return (
                <Pressable
                  key={key}
                  style={[styles.segment, selected && styles.segmentSelected]}
                  onPress={() => setPeriod(key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selected && styles.segmentTextSelected,
                    ]}
                  >
                    {PERIOD_LABELS[key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* TEMPO ATIVO */}
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="pulse-outline" size={s(24)} color="#FFFFFF" />
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Tempo ativo</Text>
              <Text style={styles.heroValue}>{data.activeTime}</Text>
              <Text style={styles.heroNote}>
                <Text style={styles.heroDelta}>{data.variation}</Text>{' '}
                comparado ao habitual
              </Text>
            </View>
          </View>

          {/* GRÁFICO */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartCaption}>Movimento</Text>
              <Text style={styles.chartCaption}>Intensidade</Text>
            </View>

            <Text style={styles.chartTitle}>Atividade ao longo do período</Text>

            <View style={styles.chartArea}>
              <View style={[styles.gridLine, { top: 0 }]} />
              <View style={[styles.gridLine, { top: '50%' }]} />

              <View
                style={[
                  styles.bars,
                  period === 'week' && styles.barsWeek,
                ]}
              >
                {data.bars.map((bar, index) => (
                  <View
                    key={index}
                    style={[
                      styles.bar,
                      { height: `${bar.value}%` },
                      bar.intense && styles.barIntense,
                    ]}
                  />
                ))}
              </View>
            </View>

            <View
              style={[
                styles.axis,
                period === 'week' ? styles.axisWeek : styles.axisToday,
              ]}
            >
              {data.axis.map((label) => (
                <Text
                  key={label}
                  style={[
                    styles.axisLabel,
                    period === 'week' && styles.axisLabelWeek,
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>

          {/* RESUMO */}
          <Text style={styles.sectionTitle}>{data.summaryTitle}</Text>

          {statRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.statsRow}>
              {row.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons
                      name={stat.icon}
                      size={s(18)}
                      color={colors.primary}
                    />
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>

                  <Text style={styles.statValue} numberOfLines={1}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statHint}>{stat.hint}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* EVENTOS */}
          <View style={styles.eventsCard}>
            {events.map((event, index) => (
              <View
                key={event.title}
                style={[
                  styles.eventRow,
                  index > 0 && styles.eventRowDivider,
                ]}
              >
                <View
                  style={[
                    styles.eventDot,
                    {
                      backgroundColor:
                        event.kind === 'intense' ? ui.intense : ui.rest,
                    },
                  ]}
                />

                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>

                <Text style={styles.eventDuration}>{event.duration}</Text>
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

    iconButton: {
      width: s(44),
      height: s(44),
      borderRadius: s(12),
      backgroundColor: ui.card,
      borderWidth: 1,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: fonts.extrabold,
      fontSize: s(22),
      color: ui.strong,
    },

    /* PET */

    petCard: {
      marginTop: s(16),
      backgroundColor: ui.card,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: border,
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      flexDirection: 'row',
      alignItems: 'center',
    },

    petInfo: {
      flex: 1,
      marginLeft: s(12),
    },

    petName: {
      fontFamily: fonts.extrabold,
      fontSize: s(16),
      color: colors.text,
    },

    petBreed: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: 1,
    },

    onlineBadge: {
      backgroundColor: ui.tealSoft,
      borderRadius: s(12),
      paddingHorizontal: s(10),
      paddingVertical: s(4),
    },

    onlineText: {
      fontFamily: fonts.extrabold,
      fontSize: s(11),
      color: colors.primary,
    },

    /* HOJE / 7 DIAS */

    segmented: {
      marginTop: s(14),
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

    /* TEMPO ATIVO */

    heroCard: {
      marginTop: s(14),
      backgroundColor: colors.primary,
      borderRadius: s(14),
      paddingVertical: s(16),
      paddingHorizontal: s(16),
      flexDirection: 'row',
      alignItems: 'center',
    },

    heroIcon: {
      width: s(48),
      height: s(48),
      borderRadius: s(12),
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroContent: {
      flex: 1,
      marginLeft: s(14),
    },

    heroLabel: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#D4F4F1',
    },

    heroValue: {
      fontFamily: fonts.extrabold,
      fontSize: s(32),
      lineHeight: s(38),
      color: '#FFFFFF',
    },

    heroNote: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#D4F4F1',
    },

    heroDelta: {
      fontFamily: fonts.bold,
      color: '#8DF0B7',
    },

    /* GRÁFICO */

    chartCard: {
      marginTop: s(14),
      backgroundColor: ui.card,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: border,
      padding: s(14),
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
      fontFamily: fonts.bold,
      fontSize: s(15),
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
      backgroundColor: '#E3ECEA',
    },

    bars: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: s(6),
      borderBottomWidth: 1,
      borderBottomColor: '#E3ECEA',
    },

    barsWeek: {
      gap: s(10),
    },

    bar: {
      flex: 1,
      borderTopLeftRadius: s(4),
      borderTopRightRadius: s(4),
      backgroundColor: ui.tealBarStrong,
    },

    barIntense: {
      backgroundColor: colors.primary,
    },

    axis: {
      flexDirection: 'row',
      marginTop: s(6),
    },

    axisToday: {
      justifyContent: 'space-between',
    },

    axisWeek: {
      gap: s(10),
    },

    axisLabel: {
      fontFamily: fonts.medium,
      fontSize: s(10),
      color: ui.muted,
    },

    axisLabelWeek: {
      flex: 1,
      textAlign: 'center',
    },

    /* RESUMO */

    sectionTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(18),
      color: ui.strong,
      marginTop: s(22),
      marginBottom: s(10),
    },

    statsRow: {
      flexDirection: 'row',
      gap: s(12),
      marginBottom: s(12),
    },

    statCard: {
      flex: 1,
      backgroundColor: ui.card,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: border,
      padding: s(14),
      minHeight: s(100),
    },

    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },

    statLabel: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: ui.muted,
    },

    statValue: {
      fontFamily: fonts.extrabold,
      fontSize: s(24),
      color: colors.text,
      marginTop: s(8),
    },

    statHint: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: s(2),
    },

    /* EVENTOS */

    eventsCard: {
      backgroundColor: ui.card,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: border,
      paddingHorizontal: s(16),
    },

    eventRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(14),
    },

    eventRowDivider: {
      borderTopWidth: 1,
      borderTopColor: '#E3ECEA',
    },

    eventDot: {
      width: s(8),
      height: s(8),
      borderRadius: s(4),
      marginRight: s(12),
    },

    eventInfo: {
      flex: 1,
    },

    eventTitle: {
      fontFamily: fonts.bold,
      fontSize: s(13),
      color: colors.text,
    },

    eventTime: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: 1,
    },

    eventDuration: {
      fontFamily: fonts.extrabold,
      fontSize: s(13),
      color: colors.text,
    },
  });
}

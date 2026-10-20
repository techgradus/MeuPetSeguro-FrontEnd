import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PhoneFrame from '@/components/PhoneFrame';
import { themed } from '@/constants/darkTheme';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { isPetId, PetId, pets } from '@/data/pets';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';

/* ============================================================
   DADOS MOCK
   Quando existir API, troque por dados reais do pet.
============================================================ */

type Bar = {
  /** Altura relativa, de 0 a 100 */
  value: number;
  /** Barra laranja = abaixo do esperado */
  attention?: boolean;
};

type Insight = {
  id: string;
  kind: 'activity' | 'feeding';
  title: string;
  description: string;
  /** Destaca a borda do card (ponto de atenção) */
  attention?: boolean;
  bars?: Bar[];
  /** Texto do rodapé: link (activity) ou aviso "tudo certo" (feeding) */
  footer: string;
};

type Report = {
  score: number;
  summary: string;
  insights: Insight[];
};

const weekBars: Bar[] = [
  { value: 100 },
  { value: 87 },
  { value: 48, attention: true },
  { value: 52, attention: true },
  { value: 83 },
];

const feedingInsight: Insight = {
  id: 'feeding',
  kind: 'feeding',
  title: 'Alimentação consistente',
  description:
    'Os horários e porções permanecem dentro do padrão saudável das últimas quatro semanas.',
  footer: 'Nenhuma ação necessária',
};

const reports: Record<PetId, Report> = {
  Rex: {
    score: 82,
    summary: 'Bom, com um ponto de atenção',
    insights: [
      {
        id: 'activity',
        kind: 'activity',
        title: 'Atividade 40% menor que o normal',
        description:
          'Rex se movimentou menos entre terça e quinta, especialmente no período da tarde.',
        attention: true,
        bars: weekBars,
        footer: 'Ver análise completa',
      },
      feedingInsight,
    ],
  },
  Mia: {
    score: 82,
    summary: 'Bom, com um ponto de atenção',
    insights: [
      {
        id: 'activity',
        kind: 'activity',
        title: 'Atividade matinal acima da média',
        description: 'Mia explorou mais a casa durante as manhãs desta semana.',
        attention: true,
        bars: weekBars,
        footer: 'Ver análise completa',
      },
      feedingInsight,
    ],
  },
};

/* ============================================================
   ANEL DE PROGRESSO
   Feito só com Views (sem react-native-svg): duas metades de
   círculo giradas, uma para cada lado do anel.
============================================================ */

function ScoreRing({
  percent,
  size,
  thickness,
  color,
  trackColor,
  children,
}: {
  percent: number;
  size: number;
  thickness: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
}) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  // Metade direita: 0–50%. Metade esquerda: 50–100%.
  const rightAngle = -135 + (Math.min(clamped, 50) / 50) * 180;
  const leftAngle = 45 + (Math.max(clamped - 50, 0) / 50) * 180;

  const arc = {
    position: 'absolute',
    top: 0,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: thickness,
    borderColor: 'transparent',
    borderTopColor: color,
    borderRightColor: color,
  } as const;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      {/* trilho */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: trackColor,
        }}
      />

      {/* metade direita */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: size / 2,
          width: size / 2,
          height: size,
          overflow: 'hidden',
        }}
      >
        <View
          style={[
            arc,
            { left: -size / 2, transform: [{ rotate: `${rightAngle}deg` }] },
          ]}
        />
      </View>

      {/* metade esquerda */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size / 2,
          height: size,
          overflow: 'hidden',
        }}
      >
        <View
          style={[arc, { left: 0, transform: [{ rotate: `${leftAngle}deg` }] }]}
        />
      </View>

      {children}
    </View>
  );
}

/* ============================================================
   TELA
============================================================ */

export default function ReportsScreen() {
  const router = useRouter();
  const { bg } = useAppTheme();
  const { pet: petParam } = useLocalSearchParams<{ pet?: string }>();

  // Recebe da Home: /relatorios?pet=Mia. Sem parâmetro, usa o Rex.
  const petId: PetId = isPetId(petParam) ? petParam : 'Rex';
  const pet = pets[petId];
  const report = reports[petId];

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
      layout.dark,
    ],
  );

  function openActivity() {
    router.push({ pathname: '/activity', params: { pet: petId } });
  }

  function openFeeding() {
    router.push({
      pathname: '/alimentacao',
      params: { pet: petId, tab: 'food' },
    });
  }

  return (
    <PhoneFrame active="reports">
      {/* Esconde o cabeçalho nativo; a tela tem o próprio */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* CABEÇALHO */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>RELATÓRIOS</Text>
              <Text style={styles.title} numberOfLines={1}>
                Insights de {pet.name}
              </Text>
            </View>

            <Pressable
              style={styles.sparkButton}
              accessibilityRole="button"
              accessibilityLabel="Sobre os insights"
              // TODO: abrir explicação sobre os insights
              onPress={() => {}}
            >
              <Ionicons name="sparkles-outline" size={s(22)} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* BEM-ESTAR */}
          <View style={styles.heroCard}>
            <View style={styles.heroInfo}>
              <Text style={styles.heroLabel}>Bem-estar esta semana</Text>

              <Text style={styles.heroScore}>
                {report.score}
                <Text style={styles.heroMax}> / 100</Text>
              </Text>

              <Text style={styles.heroSummary}>{report.summary}</Text>
            </View>

            <ScoreRing
              percent={report.score}
              size={s(84)}
              thickness={s(9)}
              color="#FFFFFF"
              trackColor="rgba(255,255,255,0.28)"
            >
              <Text style={styles.ringText}>{report.score}%</Text>
            </ScoreRing>
          </View>

          {/* ATALHOS */}
          <View style={styles.shortcuts}>
            <Pressable
              style={styles.shortcut}
              onPress={openActivity}
              accessibilityRole="button"
              accessibilityLabel="Atividade. Ver detalhes"
            >
              <Ionicons name="pulse-outline" size={s(22)} color={colors.primary} />

              <View style={styles.shortcutText}>
                <Text style={styles.shortcutTitle}>Atividade</Text>
                <Text style={styles.shortcutHint}>Ver detalhes</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={s(18)}
                color={colors.primary}
              />
            </Pressable>

            <Pressable
              style={styles.shortcut}
              onPress={openFeeding}
              accessibilityRole="button"
              accessibilityLabel="Alimentação. Ver consumo"
            >
              <Ionicons
                name="restaurant-outline"
                size={s(22)}
                color={colors.primary}
              />

              <View style={styles.shortcutText}>
                <Text style={styles.shortcutTitle}>Alimentação</Text>
                <Text style={styles.shortcutHint}>Ver consumo</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={s(18)}
                color={colors.primary}
              />
            </Pressable>
          </View>

          {/* ANÁLISES RECENTES */}
          <Text style={[styles.eyebrow, styles.sectionEyebrow]}>
            ANÁLISES RECENTES
          </Text>
          <Text style={styles.sectionTitle}>O que notamos</Text>

          {report.insights.map((insight) => {
            const isActivity = insight.kind === 'activity';

            return (
              <View
                key={insight.id}
                style={[
                  styles.insightCard,
                  insight.attention
                    ? styles.insightCardAttention
                    : styles.insightCardNormal,
                ]}
              >
                <View style={styles.insightTop}>
                  <View style={styles.aiBadge}>
                    <MaterialCommunityIcons
                      name="robot-outline"
                      size={s(13)}
                      color="#E8604F"
                    />
                    <Text style={styles.aiBadgeText}>GERADO POR IA</Text>
                  </View>

                  <View
                    style={[
                      styles.insightIcon,
                      {
                        backgroundColor: bg(isActivity ? ui.tealSoft : '#FFE9CC'),
                      },
                    ]}
                  >
                    <Ionicons
                      name={isActivity ? 'pulse-outline' : 'restaurant-outline'}
                      size={s(20)}
                      color={isActivity ? colors.primary : '#E08E00'}
                    />
                  </View>
                </View>

                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightText}>{insight.description}</Text>

                {insight.bars && (
                  <View style={styles.miniChart} accessibilityElementsHidden>
                    {insight.bars.map((bar, index) => (
                      <View
                        key={index}
                        style={[
                          styles.miniBar,
                          { height: `${bar.value}%` },
                          bar.attention && styles.miniBarAttention,
                        ]}
                      />
                    ))}
                  </View>
                )}

                {isActivity ? (
                  <Pressable
                    style={styles.linkRow}
                    onPress={openActivity}
                    accessibilityRole="link"
                  >
                    <Text style={styles.linkText}>{insight.footer}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={s(18)}
                      color={colors.primary}
                    />
                  </Pressable>
                ) : (
                  <View style={styles.okRow}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={s(16)}
                      color={colors.primary}
                    />
                    <Text style={styles.okText}>{insight.footer}</Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* AVISO */}
          <View style={styles.disclaimer}>
            <Ionicons name="sparkles-outline" size={s(16)} color="#7E8C8A" />
            <Text style={styles.disclaimerText}>
              Insights ajudam no acompanhamento, mas não substituem orientação
              veterinária.
            </Text>
          </View>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}

/* ============================================================
   ESTILOS (dependem do tamanho da tela)
============================================================ */

function makeStyles({ dark, s, isWeb, insetTop, navHeight }: Layout) {
  const border = '#D2E8E3';

  return StyleSheet.create(themed({
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

    headerText: {
      flex: 1,
      marginRight: s(12),
    },

    eyebrow: {
      fontFamily: fonts.bold,
      fontSize: s(11),
      letterSpacing: 0.8,
      color: '#6F8481',
    },

    title: {
      fontFamily: fonts.extrabold,
      fontSize: s(26),
      color: ui.strong,
      marginTop: s(2),
    },

    sparkButton: {
      width: s(44),
      height: s(44),
      borderRadius: s(12),
      backgroundColor: ui.intense,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* BEM-ESTAR */

    heroCard: {
      marginTop: s(18),
      backgroundColor: colors.primary,
      borderRadius: s(14),
      paddingVertical: s(18),
      paddingHorizontal: s(18),
      flexDirection: 'row',
      alignItems: 'center',
    },

    heroInfo: {
      flex: 1,
      paddingRight: s(8),
    },

    heroLabel: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#D4F4F1',
    },

    heroScore: {
      fontFamily: fonts.extrabold,
      fontSize: s(52),
      lineHeight: s(60),
      color: '#FFFFFF',
    },

    heroMax: {
      fontFamily: fonts.medium,
      fontSize: s(14),
      color: '#D4F4F1',
    },

    heroSummary: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#FFFFFF',
    },

    ringText: {
      fontFamily: fonts.extrabold,
      fontSize: s(15),
      color: '#FFFFFF',
    },

    /* ATALHOS */

    shortcuts: {
      flexDirection: 'row',
      gap: s(12),
      marginTop: s(14),
    },

    shortcut: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: ui.card,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: border,
      paddingHorizontal: s(12),
      paddingVertical: s(12),
    },

    shortcutText: {
      flex: 1,
      marginLeft: s(10),
    },

    shortcutTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(13),
      color: colors.text,
    },

    shortcutHint: {
      fontFamily: fonts.medium,
      fontSize: s(10),
      color: ui.muted,
      marginTop: 1,
    },

    /* ANÁLISES RECENTES */

    sectionEyebrow: {
      marginTop: s(26),
    },

    sectionTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(22),
      color: ui.strong,
      marginTop: s(2),
      marginBottom: s(12),
    },

    insightCard: {
      backgroundColor: ui.card,
      borderRadius: s(16),
      borderWidth: 1,
      padding: s(16),
      marginBottom: s(14),
    },

    insightCardAttention: {
      borderColor: '#F0B9A8',
    },

    insightCardNormal: {
      borderColor: border,
    },

    insightTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    aiBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFE1DA',
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      gap: s(5),
    },

    aiBadgeText: {
      fontFamily: fonts.extrabold,
      fontSize: s(9),
      letterSpacing: 0.4,
      color: '#E8604F',
    },

    insightIcon: {
      width: s(40),
      height: s(40),
      borderRadius: s(12),
      alignItems: 'center',
      justifyContent: 'center',
    },

    insightTitle: {
      fontFamily: fonts.bold,
      fontSize: s(16),
      color: colors.text,
      marginTop: s(4),
    },

    insightText: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      lineHeight: s(18),
      color: '#5C6F6D',
      marginTop: s(8),
    },

    miniChart: {
      height: s(64),
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: s(10),
      marginTop: s(18),
    },

    miniBar: {
      flex: 1,
      borderTopLeftRadius: s(5),
      borderTopRightRadius: s(5),
      borderBottomLeftRadius: s(2),
      borderBottomRightRadius: s(2),
      backgroundColor: ui.tealBarStrong,
    },

    miniBarAttention: {
      backgroundColor: ui.intense,
    },

    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: s(14),
    },

    linkText: {
      fontFamily: fonts.extrabold,
      fontSize: s(12),
      color: colors.primary,
    },

    okRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      marginTop: s(10),
    },

    okText: {
      fontFamily: fonts.extrabold,
      fontSize: s(11),
      color: colors.primary,
    },

    /* AVISO */

    disclaimer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginTop: s(4),
      paddingHorizontal: s(4),
    },

    disclaimerText: {
      flex: 1,
      fontFamily: fonts.medium,
      fontSize: s(10),
      color: '#6F8481',
    },
  }, dark));
}

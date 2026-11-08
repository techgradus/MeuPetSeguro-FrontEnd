import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyPetsNotice } from '@/components/pets/EmptyPetsNotice';
import PhoneFrame from '@/components/PhoneFrame';
import { themed } from '@/constants/darkTheme';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDashboardPets } from '@/hooks/useDashboardPets';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';
import { usePetReport } from '@/hooks/usePetReport';
import { newPetDraft } from '@/services/newPetDraft';
import type { CardKind } from '@/utils/petReport';


const KIND_STYLE: Record<CardKind, { icon: keyof typeof Ionicons.glyphMap; color: string; soft: string }> = {
  activity: { icon: 'pulse-outline', color: colors.primary, soft: ui.tealSoft },
  feeding: { icon: 'restaurant-outline', color: '#E08E00', soft: '#FFE9CC' },
  water: { icon: 'water-outline', color: '#3A94C9', soft: '#D6EEFB' },
};


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

  const { pets, loading: petsLoading, error: petsError, reload } = useDashboardPets();
  const pet = pets.find((p) => p.id === petParam) ?? pets[0];

  const { report, loading, error } = usePetReport(pet);
  const [showInfo, setShowInfo] = useState(false);

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

  function addFirstPet() {
    newPetDraft.reset();
    router.push('/novo-pet');
  }

  if (!pet) {
    return (
      <PhoneFrame active="reports">
        <EmptyPetsNotice loading={petsLoading} error={petsError} onAdd={addFirstPet} onRetry={reload} />
      </PhoneFrame>
    );
  }

  function openActivity() {
    router.push({ pathname: '/activity', params: { pet: pet!.id } });
  }

  function openFeeding(tab: 'food' | 'water' = 'food') {
    router.push({ pathname: '/alimentacao', params: { pet: pet!.id, tab } });
  }

  function openAction(action: 'activity' | 'food' | 'water') {
    if (action === 'activity') openActivity();
    else openFeeding(action);
  }

  const score = report.score;

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
              accessibilityState={{ expanded: showInfo }}
              onPress={() => setShowInfo((v) => !v)}
            >
              <Ionicons name="sparkles-outline" size={s(22)} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* EXPLICAÇÃO (botão de brilho) */}
          {showInfo && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Como calculamos</Text>
              <Text style={styles.infoText}>
                A nota de bem-estar começa em 100 e perde pontos quando a IA aponta algo fora do padrão, quando a
                atividade cai em relação à semana anterior ou quando um pote está quase vazio.
              </Text>
              <Text style={styles.infoText}>
                Os cards “Gerado por IA” vêm do modelo que aprende a rotina do pet. Os cards “Análise da semana”
                são calculados pelo app com as leituras dos últimos 7 dias.
              </Text>
            </View>
          )}

          {/* BEM-ESTAR */}
          <View style={styles.heroCard}>
            <View style={styles.heroInfo}>
              <Text style={styles.heroLabel}>Bem-estar esta semana</Text>

              <Text style={styles.heroScore}>
                {score ?? '--'}
                <Text style={styles.heroMax}> / 100</Text>
              </Text>

              <Text style={styles.heroSummary}>{report.summary}</Text>
            </View>

            <ScoreRing
              percent={score ?? 0}
              size={s(84)}
              thickness={s(9)}
              color="#FFFFFF"
              trackColor="rgba(255,255,255,0.28)"
            >
              <Text style={styles.ringText}>{score === null ? '--' : `${score}%`}</Text>
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
              onPress={() => openFeeding('food')}
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

          {loading && report.cards.length === 0 && (
            <View style={styles.centerBox}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          {!loading && error && report.cards.length === 0 && (
            <Text style={styles.stateText}>{error}</Text>
          )}

          {!loading && !error && report.cards.length === 0 && (
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>Ainda não há análises</Text>
              <Text style={styles.insightText}>
                Vincule a coleira e os potes de {pet.name}. Quando eles começarem a enviar leituras, as análises
                aparecem aqui.
              </Text>
            </View>
          )}

          {report.cards.map((card) => {
            const kind = KIND_STYLE[card.kind];
            const isAi = card.source === 'ai';

            return (
              <View
                key={card.id}
                style={[
                  styles.insightCard,
                  card.attention
                    ? styles.insightCardAttention
                    : styles.insightCardNormal,
                ]}
              >
                <View style={styles.insightTop}>
                  {isAi ? (
                    <View style={styles.aiBadge}>
                      <MaterialCommunityIcons
                        name="robot-outline"
                        size={s(13)}
                        color="#E8604F"
                      />
                      <Text style={styles.aiBadgeText}>GERADO POR IA</Text>
                    </View>
                  ) : (
                    <View style={styles.weeklyBadge}>
                      <Ionicons name="calendar-outline" size={s(13)} color={colors.primary} />
                      <Text style={styles.weeklyBadgeText}>ANÁLISE DA SEMANA</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.insightIcon,
                      { backgroundColor: bg(kind.soft) },
                    ]}
                  >
                    <Ionicons name={kind.icon} size={s(20)} color={kind.color} />
                  </View>
                </View>

                <Text style={styles.insightTitle}>{card.title}</Text>
                <Text style={styles.insightText}>{card.description}</Text>

                {card.bars && (
                  <View style={styles.miniChart} accessibilityElementsHidden>
                    {card.bars.map((bar, index) => (
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

                {card.action ? (
                  <Pressable
                    style={styles.linkRow}
                    onPress={() => openAction(card.action!)}
                    accessibilityRole="link"
                  >
                    <Text style={styles.linkText}>{card.footer}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={s(18)}
                      color={colors.primary}
                    />
                  </Pressable>
                ) : (
                  <View style={styles.okRow}>
                    <Ionicons
                      name={card.attention ? 'information-circle-outline' : 'shield-checkmark-outline'}
                      size={s(16)}
                      color={card.attention ? '#6F8481' : colors.primary}
                    />
                    <Text style={card.attention ? styles.noteText : styles.okText}>{card.footer}</Text>
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

    weeklyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: ui.tealSoft,
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      gap: s(5),
    },

    weeklyBadgeText: {
      fontFamily: fonts.extrabold,
      fontSize: s(9),
      letterSpacing: 0.4,
      color: colors.primary,
    },

    noteText: {
      flex: 1,
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: '#6F8481',
    },

    infoCard: {
      marginTop: s(14),
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      padding: s(14),
    },

    infoTitle: {
      fontFamily: fonts.bold,
      fontSize: s(14),
      color: colors.text,
    },

    infoText: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      lineHeight: s(18),
      color: '#5C6F6D',
      marginTop: s(6),
    },

    centerBox: {
      paddingVertical: s(28),
      alignItems: 'center',
    },

    stateText: {
      fontFamily: fonts.medium,
      fontSize: s(13),
      color: '#6F8481',
      textAlign: 'center',
      paddingVertical: s(20),
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

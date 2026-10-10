import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PetAvatar from '@/components/PetAvatar';
import PhoneFrame from '@/components/PhoneFrame';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { Pet, PetId, petIds, pets } from '@/data/pets';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';

const user = { firstName: 'Beatriz', unreadAlerts: 5 };
const devices = { connected: 3, total: 4 };

// 7 barras; a 6ª é o pico do período (destacada no design)
const activityBars = [22, 34, 12, 41, 29, 48, 38];
const peakBarIndex = 5;

/* ============================================================
   UTILITÁRIOS
============================================================ */

const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

// "Quarta-feira, 7 de outubro"
function formatToday(date = new Date()) {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${
    MONTHS[date.getMonth()]
  }`;
}

/* ============================================================
   COMPONENTES
============================================================ */

type Styles = ReturnType<typeof makeStyles>;

function PetSelectorCard({
  pet,
  selected,
  onPress,
  styles,
  s,
}: {
  pet: Pet;
  selected: boolean;
  onPress: () => void;
  styles: Styles;
  s: Layout['s'];
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${pet.name}, ${pet.type}`}
      style={[
        styles.petCard,
        selected ? styles.petCardSelected : styles.petCardInactive,
      ]}
    >
      <PetAvatar pet={pet} size={s(36)} radius={s(8)} emojiSize={s(20)} />

      <View style={styles.petInfo}>
        <Text style={styles.petName} numberOfLines={1}>
          {pet.name}
        </Text>
        <Text style={styles.petType} numberOfLines={1}>
          {pet.type}
        </Text>
      </View>

      {selected && (
        <Ionicons name="checkmark" size={s(20)} color={colors.primary} />
      )}
    </Pressable>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
  iconColor,
  iconBackground,
  barColor,
  onPress,
  styles,
  s,
}: {
  label: string;
  value: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  barColor: string;
  onPress: () => void;
  styles: Styles;
  s: Layout['s'];
}) {
  return (
    <Pressable
      style={styles.metricCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}%. Ver detalhes`}
    >
      <View style={[styles.metricIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={s(18)} color={iconColor} />
      </View>

      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}%</Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${value}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <Text style={styles.metricDescription}>{description}</Text>
    </Pressable>
  );
}

/* ============================================================
   TELA
============================================================ */

export default function HomeScreen() {
  const router = useRouter();
  const [selectedPet, setSelectedPet] = useState<PetId>('Rex');

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

  const pet = pets[selectedPet];

  // Abre a tela de Atividade do pet que está selecionado
  function openActivity() {
    router.push({ pathname: '/activity', params: { pet: selectedPet } });
  }

  // Abre a tela de Alimentação já na aba escolhida
  function openFeeding(tab: 'food' | 'water') {
    router.push({ pathname: '/alimentacao', params: { pet: selectedPet, tab } });
  }

  return (
    <PhoneFrame active="home">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* CABEÇALHO */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.date} numberOfLines={1}>
                {formatToday()}
              </Text>
              <Text style={styles.greeting} numberOfLines={1}>
                Olá, {user.firstName}!
              </Text>
            </View>

            <Pressable
              style={styles.notificationButton}
              accessibilityRole="button"
              accessibilityLabel={`Notificações, ${user.unreadAlerts} não lidas`}
              // TODO: navegar para a Central de alertas
              onPress={() => router.navigate('/alertas')}
            >
              <Ionicons
                name="notifications-outline"
                size={s(24)}
                color={colors.text}
              />

              {user.unreadAlerts > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationNumber}>
                    {user.unreadAlerts}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* PETS */}
          <Text style={styles.followingText}>ACOMPANHANDO AGORA</Text>

          <View style={styles.petRow}>
            {petIds.map((id) => (
              <PetSelectorCard
                key={id}
                pet={pets[id]}
                selected={selectedPet === id}
                onPress={() => setSelectedPet(id)}
                styles={styles}
                s={s}
              />
            ))}
          </View>

          {/* CARD PRINCIPAL */}
          <View style={styles.mainCard}>
            <View style={styles.mainCardTop}>
              <View style={styles.mainCardContent}>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{pet.status}</Text>
                </View>

                {pet.message.map((line, index) => (
                  <Text
                    key={index}
                    style={styles.mainTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {line}
                  </Text>
                ))}
              </View>

              <View style={styles.petCircle}>
                <PetAvatar
                  pet={pet}
                  size={s(80)}
                  radius={s(40)}
                  emojiSize={s(46)}
                />

                <View style={styles.pawBadge}>
                  <Ionicons
                    name="paw-outline"
                    size={s(16)}
                    color={colors.primary}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.connectedText} numberOfLines={1}>
              Casa conectada · Atualizado agora
            </Text>
          </View>

          {/* VISÃO GERAL */}
          <Text style={styles.sectionLabel}>VISÃO GERAL</Text>

          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle} numberOfLines={1}>
              Como {pet.name} está
            </Text>

            <View style={styles.liveContainer}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Ao Vivo</Text>
            </View>
          </View>

          {/* ATIVIDADE */}
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name="pulse-outline"
                  size={s(20)}
                  color={colors.primary}
                />
              </View>

              <View style={styles.normalBadge}>
                <Text style={styles.normalText}>Normal hoje</Text>
              </View>
            </View>

            <Text style={styles.activityLabel}>Atividade atual</Text>
            <Text style={styles.activityValue}>{pet.activity}</Text>
            <Text style={styles.activityTime}>{pet.activityTime}</Text>

            <View style={styles.chartBaseline} />

            <View style={styles.chart} accessibilityElementsHidden>
              {activityBars.map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.chartBar,
                    { height: s(height) },
                    index === peakBarIndex && styles.chartBarPeak,
                  ]}
                />
              ))}
            </View>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Ver atividade de ${pet.name}`}
              onPress={openActivity}
              hitSlop={8}
            >
              <Text style={styles.activityLink}>Ver atividade</Text>
            </Pressable>
          </View>

          {/* COMIDA + ÁGUA */}
          <View style={styles.metricsRow}>
            <MetricCard
              label="Comida"
              value={pet.food}
              description={pet.foodDescription}
              icon="restaurant-outline"
              iconColor={ui.food}
              iconBackground={ui.foodSoft}
              barColor={ui.food}
              onPress={() => openFeeding('food')}
              styles={styles}
              s={s}
            />

            <MetricCard
              label="Água"
              value={pet.water}
              description={pet.waterDescription}
              icon="water-outline"
              iconColor={ui.water}
              iconBackground={ui.waterSoft}
              barColor={ui.water}
              onPress={() => openFeeding('water')}
              styles={styles}
              s={s}
            />
          </View>

          {/* DISPOSITIVOS */}
          <Pressable
            style={styles.deviceCard}
            accessibilityRole="button"
            // TODO: navegar para Config > Dispositivos
            onPress={() => {}}
          >
            <View style={styles.deviceIcon}>
              <Ionicons
                name="wifi-outline"
                size={s(20)}
                color={colors.primary}
              />
            </View>

            <View style={styles.deviceContent}>
              <Text style={styles.deviceTitle}>Dispositivos</Text>
              <Text style={styles.deviceSubtitle}>
                {devices.connected} de {devices.total} conectados
              </Text>
            </View>
          </Pressable>

          {/* NOVO INSIGHT */}
          <Pressable
            style={styles.insightCard}
            accessibilityRole="button"
            // TODO: navegar para Relatórios
            onPress={() => {}}
          >
            <View style={styles.insightIcon}>
              <Ionicons name="sparkles-outline" size={s(22)} color="#FFFFFF" />
            </View>

            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Novo Insight</Text>
              <Text style={styles.insightText}>{pet.insight}</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}

/* ============================================================
   ESTILOS (dependem do tamanho da tela)
============================================================ */

function makeStyles({ s, isWeb, insetTop, navHeight }: Layout) {
  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: s(24),
      paddingTop: isWeb ? s(24) : insetTop + s(14),
      paddingBottom: navHeight + s(24),
    },

    // Em telas largas (tablet) o conteúdo fica centralizado
    content: {
      width: '100%',
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center',
    },

    /* CABEÇALHO */

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    headerText: {
      flex: 1,
      marginRight: s(12),
    },

    date: {
      fontFamily: fonts.medium,
      fontSize: s(14),
      color: ui.muted,
      marginBottom: s(2),
    },

    greeting: {
      fontFamily: fonts.extrabold,
      fontSize: s(28),
      color: ui.strong,
    },

    notificationButton: {
      width: s(44),
      height: s(44),
      borderRadius: s(10),
      backgroundColor: ui.card,
      borderWidth: 1,
      borderColor: '#B9C4C2',
      alignItems: 'center',
      justifyContent: 'center',
    },

    notificationBadge: {
      position: 'absolute',
      top: s(3),
      right: s(3),
      minWidth: s(16),
      height: s(16),
      borderRadius: s(8),
      paddingHorizontal: 3,
      backgroundColor: ui.badge,
      alignItems: 'center',
      justifyContent: 'center',
    },

    notificationNumber: {
      fontFamily: fonts.bold,
      fontSize: s(10),
      color: '#FFFFFF',
    },

    /* PETS */

    followingText: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#444444',
      marginTop: s(16),
      marginBottom: s(8),
    },

    petRow: {
      flexDirection: 'row',
      gap: s(12),
    },

    petCard: {
      flex: 1,
      minHeight: s(58),
      borderRadius: s(10),
      paddingHorizontal: s(10),
      flexDirection: 'row',
      alignItems: 'center',
    },

    petCardSelected: {
      backgroundColor: ui.card,
      borderWidth: 1,
      borderColor: ui.cardBorder,
    },

    petCardInactive: {
      backgroundColor: ui.tealSoft,
    },

    petInfo: {
      flex: 1,
      marginLeft: s(9),
    },

    petName: {
      fontFamily: fonts.bold,
      fontSize: s(14),
      color: colors.text,
    },

    petType: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: colors.textMuted,
      marginTop: 1,
    },

    /* CARD PRINCIPAL */

    mainCard: {
      marginTop: s(14),
      borderRadius: s(10),
      backgroundColor: colors.primary,
      paddingVertical: s(16),
      paddingHorizontal: s(18),
      overflow: 'hidden',
    },

    mainCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    mainCardContent: {
      flex: 1,
      minWidth: 0,
    },

    statusBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.28)',
      borderRadius: s(10),
      paddingHorizontal: s(9),
      paddingVertical: s(3),
      marginBottom: s(8),
    },

    statusDot: {
      width: s(6),
      height: s(6),
      borderRadius: s(3),
      backgroundColor: ui.live,
      marginRight: s(5),
    },

    statusText: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: '#FFFFFF',
    },

    mainTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(24),
      lineHeight: s(28),
      color: '#FFFFFF',
    },

    connectedText: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#BDEBE6',
      marginTop: s(12),
    },

    petCircle: {
      width: s(88),
      height: s(88),
      borderRadius: s(44),
      backgroundColor: '#CDE9E3',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: s(8),
    },

    pawBadge: {
      position: 'absolute',
      right: -s(4),
      bottom: -s(4),
      width: s(30),
      height: s(30),
      borderRadius: s(15),
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* VISÃO GERAL */

    sectionLabel: {
      fontFamily: fonts.medium,
      fontSize: s(13),
      color: ui.muted,
      marginTop: s(18),
      marginBottom: s(2),
    },

    overviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: s(10),
    },

    overviewTitle: {
      flex: 1,
      fontFamily: fonts.extrabold,
      fontSize: s(18),
      color: ui.strong,
    },

    liveContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    liveDot: {
      width: s(7),
      height: s(7),
      borderRadius: s(4),
      backgroundColor: ui.live,
      marginRight: s(5),
    },

    liveText: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#555555',
    },

    /* ATIVIDADE */

    activityCard: {
      backgroundColor: ui.card,
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: ui.cardBorder,
      padding: s(14),
    },

    activityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    activityIcon: {
      width: s(32),
      height: s(32),
      borderRadius: s(7),
      backgroundColor: ui.tealSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    normalBadge: {
      backgroundColor: ui.tealSoft,
      borderRadius: s(12),
      paddingHorizontal: s(12),
      paddingVertical: s(4),
    },

    normalText: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: colors.primary,
    },

    activityLabel: {
      fontFamily: fonts.medium,
      fontSize: s(13),
      color: ui.muted,
      marginTop: s(10),
    },

    activityValue: {
      fontFamily: fonts.bold,
      fontSize: s(20),
      color: colors.text,
      marginTop: s(2),
    },

    activityTime: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#888888',
      marginTop: s(2),
    },

    chartBaseline: {
      position: 'absolute',
      left: s(14),
      right: s(14),
      bottom: s(48),
      height: 1,
      backgroundColor: '#DDE5E3',
    },

    chart: {
      position: 'absolute',
      right: s(16),
      bottom: s(49),
      height: s(52),
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: s(5),
    },

    chartBar: {
      width: s(10),
      borderRadius: s(4),
      backgroundColor: ui.tealBar,
    },

    chartBarPeak: {
      backgroundColor: colors.primary,
    },

    activityLink: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.primary,
      marginTop: s(26),
    },

    /* COMIDA + ÁGUA */

    metricsRow: {
      flexDirection: 'row',
      gap: s(12),
      marginTop: s(18),
    },

    metricCard: {
      flex: 1,
      backgroundColor: ui.card,
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: ui.cardBorder,
      padding: s(14),
      minHeight: s(132),
    },

    metricIcon: {
      width: s(30),
      height: s(30),
      borderRadius: s(7),
      alignItems: 'center',
      justifyContent: 'center',
    },

    metricLabel: {
      fontFamily: fonts.medium,
      fontSize: s(13),
      color: ui.muted,
      marginTop: s(6),
    },

    metricValue: {
      fontFamily: fonts.bold,
      fontSize: s(20),
      color: colors.text,
      marginTop: 1,
    },

    progressBackground: {
      height: s(6),
      backgroundColor: ui.track,
      borderRadius: s(3),
      overflow: 'hidden',
      marginTop: s(8),
    },

    progressFill: {
      height: '100%',
      borderRadius: s(3),
    },

    metricDescription: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: ui.muted,
      marginTop: s(7),
    },

    /* DISPOSITIVOS */

    deviceCard: {
      marginTop: s(16),
      backgroundColor: ui.card,
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: ui.cardBorder,
      paddingHorizontal: s(12),
      paddingVertical: s(12),
      flexDirection: 'row',
      alignItems: 'center',
    },

    deviceIcon: {
      width: s(34),
      height: s(34),
      borderRadius: s(8),
      backgroundColor: ui.tealSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    deviceContent: {
      flex: 1,
      marginLeft: s(12),
    },

    deviceTitle: {
      fontFamily: fonts.bold,
      fontSize: s(14),
      color: colors.text,
    },

    deviceSubtitle: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: ui.muted,
      marginTop: 1,
    },

    /* INSIGHT */

    insightCard: {
      marginTop: s(14),
      backgroundColor: ui.insightBg,
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: ui.insightBorder,
      paddingHorizontal: s(12),
      paddingVertical: s(12),
      flexDirection: 'row',
      alignItems: 'center',
    },

    insightIcon: {
      width: s(36),
      height: s(36),
      borderRadius: s(8),
      backgroundColor: ui.insightAccent,
      alignItems: 'center',
      justifyContent: 'center',
    },

    insightContent: {
      flex: 1,
      marginLeft: s(12),
    },

    insightLabel: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: ui.insightAccent,
    },

    insightText: {
      fontFamily: fonts.medium,
      fontSize: s(13),
      color: colors.text,
      marginTop: 1,
    },
  });
}

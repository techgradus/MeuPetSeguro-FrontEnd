import { useTabNavigation } from '@/hooks/useTabNavigation';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fonts } from '@/constants/petTheme';

const { width: screenWidth } = Dimensions.get('window');

const MOBILE_WIDTH = 390;
const PHONE_WIDTH = Math.min(MOBILE_WIDTH, screenWidth - 32);

/* ============================================================
   CORES DA HOME (as do design que não existem no petTheme)
============================================================ */

const ui = {
  screenBackground: '#F6FBFB',
  card: '#FFFFFF',
  cardBorder: '#BFEBD6',
  tealSoft: '#C6F1EC',
  tealBar: '#8BDDD5',
  muted: '#777777',
  strong: '#111111',
  track: '#E1E1E1',
  food: '#E08E00',
  foodSoft: '#FFF0D5',
  water: '#6FB1DD',
  waterSoft: '#DCEAF3',
  insightBg: '#FFE1DA',
  insightBorder: '#F0A9A5',
  insightAccent: '#D6405A',
  badge: '#E53935',
  live: '#49B94A',
};

/* ============================================================
   DADOS MOCK
   Mesmos valores das telas de Alertas, Atividade, Alimentação
   e Relatórios. Quando o time criar a camada de dados, isto
   vira data/pets.ts.
============================================================ */

type PetId = 'Rex' | 'Mia';

type Pet = {
  id: PetId;
  name: string;
  type: string;
  photo: ImageSourcePropType | null; // ex.: require('@/assets/images/rex.png')
  status: string;
  message: string[];
  activity: string;
  activityTime: string;
  food: number;
  water: number;
  foodDescription: string;
  waterDescription: string;
  insight: string;
};

const pets: Record<PetId, Pet> = {
  Rex: {
    id: 'Rex',
    name: 'Rex',
    type: 'Cachorro',
    photo: require('@/assets/images/pet-perfil.jpeg'),
    status: 'Tudo tranquilo',
    message: ['Rex está', 'descansando'],
    activity: 'Repouso',
    activityTime: 'há 13 minutos',
    food: 68,
    water: 42,
    foodDescription: 'Nível confortável',
    waterDescription: 'Repor em breve',
    insight: 'A rotina do Rex mudou essa semana',
  },
  Mia: {
    id: 'Mia',
    name: 'Mia',
    type: 'Gato',
    photo: require('@/assets/images/mia-perfil.jpeg'),
    status: 'Tudo tranquilo',
    message: ['Mia está', 'explorando a', 'casa'],
    activity: 'Leve',
    activityTime: 'Ativa agora',
    food: 54,
    water: 76,
    foodDescription: 'Repor em breve',
    waterDescription: 'Nível confortável',
    insight: 'Mia está mais ativa no período da manhã',
  },
};

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

// "Domingo, 20 de setembro"
function formatToday(date = new Date()) {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${
    MONTHS[date.getMonth()]
  }`;
}

/* ============================================================
   COMPONENTES
============================================================ */

function PetAvatar({
  pet,
  size,
  radius,
  emojiSize,
}: {
  pet: Pet;
  size: number;
  radius: number;
  emojiSize: number;
}) {
  const box = { width: size, height: size, borderRadius: radius };

  if (pet.photo) {
    return <Image source={pet.photo} style={box} resizeMode="cover" />;
  }

  return (
    <View style={[styles.avatarFallback, box]}>
      <Ionicons name="paw" size={emojiSize} color={colors.primary} />
    </View>
  );
}

function PetSelectorCard({
  pet,
  selected,
  onPress,
}: {
  pet: Pet;
  selected: boolean;
  onPress: () => void;
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
      <PetAvatar pet={pet} size={36} radius={8} emojiSize={20} />

      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petType}>{pet.type}</Text>
      </View>

      {selected && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
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
}: {
  label: string;
  value: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  barColor: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}%</Text>

      <View
        style={styles.progressBackground}
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: value }}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${value}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <Text style={styles.metricDescription}>{description}</Text>
    </View>
  );
}

type BottomItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  notification?: boolean;
  onPress?: () => void;
};

function BottomItem({
  icon,
  activeIcon,
  label,
  active = false,
  notification = false,
  onPress,
}: BottomItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.bottomItem, active && styles.bottomItemActive]}
    >
      <View style={styles.bottomIconContainer}>
        <Ionicons
          name={active && activeIcon ? activeIcon : icon}
          size={24}
          color={active ? colors.primary : '#7E8C8A'}
        />

        {notification && <View style={styles.bottomNotification} />}
      </View>

      <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ============================================================
   TELA
============================================================ */

export default function HomeScreen() {
  const [selectedPet, setSelectedPet] = useState<PetId>('Rex');
  const goToTab = useTabNavigation();

  const pet = pets[selectedPet];

  return (
    <View style={styles.browserBackground}>
      {/* Moldura de celular no navegador */}
      <View style={styles.phone}>
        {/* Barra superior simulando o aparelho */}
        <View style={styles.phoneTop}>
          <View style={styles.camera} />
        </View>

        <View style={styles.screen}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* CABEÇALHO */}
            <View style={styles.header}>
              <View>
                <Text style={styles.date}>{formatToday()}</Text>
                <Text style={styles.greeting}>Olá, {user.firstName}!</Text>
              </View>

              <Pressable
                style={styles.notificationButton}
                accessibilityRole="button"
                accessibilityLabel={`Notificações, ${user.unreadAlerts} não lidas`}
                // TODO: navegar para a Central de alertas
                onPress={() => {}}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
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
              {(Object.keys(pets) as PetId[]).map((id) => (
                <PetSelectorCard
                  key={id}
                  pet={pets[id]}
                  selected={selectedPet === id}
                  onPress={() => setSelectedPet(id)}
                />
              ))}
            </View>

            {/* CARD PRINCIPAL */}
            <View style={styles.mainCard}>
              <View style={styles.mainCardContent}>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{pet.status}</Text>
                </View>

                {pet.message.map((line, index) => (
                  <Text key={index} style={styles.mainTitle}>
                    {line}
                  </Text>
                ))}

                <Text style={styles.connectedText}>
                  Casa conectada · Atualizado agora
                </Text>
              </View>

              <View style={styles.petCircle}>
                <PetAvatar pet={pet} size={96} radius={48} emojiSize={54} />

                <View style={styles.pawBadge}>
                  <Ionicons name="paw-outline" size={17} color={colors.primary} />
                </View>
              </View>
            </View>

            {/* VISÃO GERAL */}
            <Text style={styles.sectionLabel}>VISÃO GERAL</Text>

            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Como {pet.name} está</Text>

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
                    size={20}
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
                      { height },
                      index === peakBarIndex && styles.chartBarPeak,
                    ]}
                  />
                ))}
              </View>

              <Pressable
                accessibilityRole="link"
                // TODO: navegar para a tela de Atividade do pet selecionado
                onPress={() => {}}
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
              />

              <MetricCard
                label="Água"
                value={pet.water}
                description={pet.waterDescription}
                icon="water-outline"
                iconColor={ui.water}
                iconBackground={ui.waterSoft}
                barColor={ui.water}
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
                <Ionicons name="wifi-outline" size={20} color={colors.primary} />
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
                <Ionicons name="sparkles-outline" size={22} color="#FFFFFF" />
              </View>

              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Novo Insight</Text>
                <Text style={styles.insightText}>{pet.insight}</Text>
              </View>
            </Pressable>

            {/* ESPAÇO PARA NÃO FICAR ATRÁS DA BARRA */}
            <View style={{ height: 96 }} />
          </ScrollView>

          {/* BOTTOM NAVIGATION */}
          <View style={styles.bottomNavigation}>
            <BottomItem
              icon="home-outline"
              activeIcon="home"
              label="Início"
              active
            />

            <BottomItem icon="paw-outline" activeIcon="paw" label="Meu Pet" 
             onPress={() => goToTab('meus-pets')}
            />  
            

            <BottomItem
              icon="notifications-outline"
              label="Alertas"
              notification
            />

            <BottomItem icon="analytics-outline" label="Relatórios" />

            <BottomItem icon="settings-outline" label="Config" />
          </View>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   ESTILOS
============================================================ */

const styles = StyleSheet.create({
  /*
   * NAVEGADOR
   *
   * No computador: o app fica centralizado dentro de um celular.
   * No celular: o container ocupa praticamente toda a largura.
   */
  browserBackground: {
    flex: 1,
    backgroundColor: '#E9F3F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'web' ? 20 : 0,
  },

  phone: {
    width: PHONE_WIDTH,
    height: Platform.OS === 'web' ? 844 : '100%',
    maxHeight: 844,
    backgroundColor: '#263D3D',
    borderRadius: Platform.OS === 'web' ? 42 : 0,
    padding: Platform.OS === 'web' ? 6 : 0,

    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#193333',
          shadowOpacity: 0.25,
          shadowRadius: 25,
          shadowOffset: { width: 0, height: 12 },
        }
      : {}),
  },

  phoneTop: {
    height: Platform.OS === 'web' ? 12 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#263D3D',
  },

  camera: {
    width: 45,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#162A2A',
  },

  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: ui.screenBackground,
    borderRadius: Platform.OS === 'web' ? 36 : 0,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  /* CABEÇALHO */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  date: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: ui.muted,
    marginBottom: 2,
  },

  greeting: {
    fontFamily: fonts.extrabold,
    fontSize: 30,
    color: ui.strong,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: ui.card,
    borderWidth: 1,
    borderColor: '#B9C4C2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: ui.badge,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationNumber: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },

  /* PETS */

  followingText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#444444',
    marginTop: 14,
    marginBottom: 8,
  },

  petRow: {
    flexDirection: 'row',
    gap: 12,
  },

  petCard: {
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    paddingHorizontal: 10,
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

  avatarFallback: {
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  petInfo: {
    flex: 1,
    marginLeft: 9,
  },

  petName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },

  petType: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },

  /* CARD PRINCIPAL */

  mainCard: {
    marginTop: 14,
    minHeight: 160,
    borderRadius: 10,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  mainCardContent: {
    flex: 1,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 8,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ui.live,
    marginRight: 5,
  },

  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#FFFFFF',
  },

  mainTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 34,
    color: '#FFFFFF',
  },

  connectedText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#BDEBE6',
    marginTop: 10,
  },

  petCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#CDE9E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  pawBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* VISÃO GERAL */

  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: ui.muted,
    marginTop: 18,
    marginBottom: 2,
  },

  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  overviewTitle: {
    flex: 1,
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: ui.strong,
  },

  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ui.live,
    marginRight: 5,
  },

  liveText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#555555',
  },

  /* ATIVIDADE */

  activityCard: {
    backgroundColor: ui.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.cardBorder,
    padding: 14,
  },

  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: ui.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  normalBadge: {
    backgroundColor: ui.tealSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  normalText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.primary,
  },

  activityLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: ui.muted,
    marginTop: 10,
  },

  activityValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginTop: 2,
  },

  activityTime: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },

  chartBaseline: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 48,
    height: 1,
    backgroundColor: '#DDE5E3',
  },

  chart: {
    position: 'absolute',
    right: 16,
    bottom: 49,
    height: 52,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
  },

  chartBar: {
    width: 10,
    borderRadius: 4,
    backgroundColor: ui.tealBar,
  },

  chartBarPeak: {
    backgroundColor: colors.primary,
  },

  activityLink: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors.primary,
    marginTop: 26,
  },

  /* COMIDA + ÁGUA */

  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },

  metricCard: {
    flex: 1,
    backgroundColor: ui.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.cardBorder,
    padding: 14,
    minHeight: 132,
  },

  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: ui.muted,
    marginTop: 6,
  },

  metricValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text,
    marginTop: 1,
  },

  progressBackground: {
    height: 6,
    backgroundColor: ui.track,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  metricDescription: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: ui.muted,
    marginTop: 7,
  },

  /* DISPOSITIVOS */

  deviceCard: {
    marginTop: 16,
    backgroundColor: ui.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  deviceIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: ui.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deviceContent: {
    flex: 1,
    marginLeft: 12,
  },

  deviceTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },

  deviceSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: ui.muted,
    marginTop: 1,
  },

  /* INSIGHT */

  insightCard: {
    marginTop: 14,
    backgroundColor: ui.insightBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ui.insightBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: ui.insightAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightContent: {
    flex: 1,
    marginLeft: 12,
  },

  insightLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: ui.insightAccent,
  },

  insightText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
    marginTop: 1,
  },

  /* BOTTOM NAV */

  bottomNavigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    backgroundColor: '#FDFEFB',
    borderTopWidth: 1,
    borderTopColor: '#B5BFBD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },

  bottomItem: {
    width: 68,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  bottomItemActive: {
    backgroundColor: ui.tealSoft,
  },

  bottomIconContainer: {
    position: 'relative',
    height: 26,
    justifyContent: 'center',
  },

  bottomNotification: {
    position: 'absolute',
    right: -2,
    top: 1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7E8C8A',
  },

  bottomLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#7E8C8A',
    marginTop: 2,
  },

  bottomLabelActive: {
    color: colors.primary,
  },
});

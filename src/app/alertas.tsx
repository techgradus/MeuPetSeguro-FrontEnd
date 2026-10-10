import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PetAvatar from '@/components/PetAvatar';
import PhoneFrame from '@/components/PhoneFrame';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { AlertKind, alerts as initialAlerts, PetAlert } from '@/data/alerts';
import { PetId, petIds, pets } from '@/data/pets';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';

/* ============================================================
   ÍCONE E CORES DE CADA TIPO DE ALERTA
============================================================ */

type KindStyle = {
  color: string;
  background: string;
  icon: (size: number, color: string) => React.ReactElement;
};

const KIND_STYLE: Record<AlertKind, KindStyle> = {
  'vaccine-late': {
    color: '#E5484D',
    background: '#FFE1DA',
    icon: (size, color) => (
      <MaterialCommunityIcons name="needle" size={size} color={color} />
    ),
  },
  'vaccine-soon': {
    color: '#E8922B',
    background: '#FFE9CC',
    icon: (size, color) => (
      <MaterialCommunityIcons name="needle" size={size} color={color} />
    ),
  },
  water: {
    color: '#3A94C9',
    background: '#D6EEFB',
    icon: (size, color) => (
      <Ionicons name="water-outline" size={size} color={color} />
    ),
  },
  pattern: {
    color: '#E8604F',
    background: '#FFE1DA',
    icon: (size, color) => (
      <MaterialCommunityIcons name="robot-outline" size={size} color={color} />
    ),
  },
  camera: {
    color: '#E8604F',
    background: '#FFE1DA',
    icon: (size, color) => (
      <MaterialCommunityIcons name="wifi-off" size={size} color={color} />
    ),
  },
  meal: {
    color: '#E08E00',
    background: '#FFE9CC',
    icon: (size, color) => (
      <Ionicons name="restaurant-outline" size={size} color={color} />
    ),
  },
  activity: {
    color: colors.primary,
    background: ui.tealSoft,
    icon: (size, color) => (
      <Ionicons name="pulse-outline" size={size} color={color} />
    ),
  },
};

type PetFilter = 'all' | PetId;
type ReadFilter = 'all' | 'unread';

/* ============================================================
   TELA
============================================================ */

export default function AlertsScreen() {
  const [items, setItems] = useState<PetAlert[]>(initialAlerts);
  const [petFilter, setPetFilter] = useState<PetFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

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

  const matchesPet = (alert: PetAlert) =>
    petFilter === 'all' || alert.petId === petFilter;

  // Os contadores acompanham o filtro de pet
  const byPet = items.filter(matchesPet);
  const totalCount = byPet.length;
  const unreadCount = byPet.filter((alert) => !alert.read).length;

  const visible =
    readFilter === 'unread' ? byPet.filter((alert) => !alert.read) : byPet;

  function markAllAsRead() {
    setItems((current) =>
      current.map((alert) =>
        matchesPet(alert) ? { ...alert, read: true } : alert,
      ),
    );
  }

  function markAsRead(id: string) {
    setItems((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert,
      ),
    );
  }

  return (
    <PhoneFrame active="alerts">
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
              <Text style={styles.eyebrow}>FIQUE POR DENTRO</Text>
              <Text style={styles.title}>Central de alertas</Text>
            </View>

            <Pressable
              onPress={markAllAsRead}
              disabled={unreadCount === 0}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityState={{ disabled: unreadCount === 0 }}
            >
              <Text
                style={[
                  styles.markRead,
                  unreadCount === 0 && styles.markReadDisabled,
                ]}
              >
                Marcar como lidas
              </Text>
            </Pressable>
          </View>

          {/* FILTRO POR PET */}
          <View style={styles.chipsRow}>
            <Pressable
              style={[styles.chip, petFilter === 'all' && styles.chipSelected]}
              onPress={() => setPetFilter('all')}
              accessibilityRole="button"
              accessibilityState={{ selected: petFilter === 'all' }}
            >
              <Text
                style={[
                  styles.chipText,
                  petFilter === 'all' && styles.chipTextSelected,
                ]}
              >
                Todos os pets
              </Text>
            </Pressable>

            {petIds.map((id) => {
              const selected = petFilter === id;

              return (
                <Pressable
                  key={id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setPetFilter(id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <PetAvatar
                    pet={pets[id]}
                    size={s(22)}
                    radius={s(11)}
                    emojiSize={s(12)}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      styles.chipTextWithAvatar,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {pets[id].name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* TODOS / NÃO LIDOS */}
          <View style={styles.pillsRow}>
            <Pressable
              style={[styles.pill, readFilter === 'all' && styles.pillSelected]}
              onPress={() => setReadFilter('all')}
              accessibilityRole="button"
              accessibilityState={{ selected: readFilter === 'all' }}
            >
              <Text
                style={[
                  styles.pillText,
                  readFilter === 'all' && styles.pillTextSelected,
                ]}
              >
                Todos
              </Text>
              <Text
                style={[
                  styles.pillCount,
                  readFilter === 'all' && styles.pillCountSelected,
                ]}
              >
                {totalCount}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.pill,
                readFilter === 'unread' && styles.pillSelected,
              ]}
              onPress={() => setReadFilter('unread')}
              accessibilityRole="button"
              accessibilityState={{ selected: readFilter === 'unread' }}
            >
              <Text
                style={[
                  styles.pillText,
                  readFilter === 'unread' && styles.pillTextSelected,
                ]}
              >
                Não lidos
              </Text>
              <Text
                style={[
                  styles.pillCount,
                  readFilter === 'unread' && styles.pillCountSelected,
                ]}
              >
                {unreadCount}
              </Text>
            </Pressable>
          </View>

          {/* LISTA */}
          {visible.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={s(26)}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>Tudo em dia</Text>
              <Text style={styles.emptyText}>
                Você não tem alertas {readFilter === 'unread' ? 'não lidos ' : ''}
                por aqui.
              </Text>
            </View>
          ) : (
            visible.map((alert) => {
              const kind = KIND_STYLE[alert.kind];
              const pet = pets[alert.petId];

              return (
                <Pressable
                  key={alert.id}
                  onPress={() => markAsRead(alert.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${alert.title}, ${pet.name}. ${alert.description} ${alert.time}${
                    alert.read ? '' : '. Não lido'
                  }`}
                  style={[
                    styles.card,
                    alert.read ? styles.cardRead : styles.cardUnread,
                  ]}
                >
                  <View
                    style={[styles.iconBox, { backgroundColor: kind.background }]}
                  >
                    {kind.icon(s(22), kind.color)}
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.petChip}>
                      <PetAvatar
                        pet={pet}
                        size={s(16)}
                        radius={s(8)}
                        emojiSize={s(9)}
                      />
                      <Text style={styles.petChipText}>{pet.name}</Text>
                    </View>

                    <Text style={styles.cardTitle}>{alert.title}</Text>
                    <Text style={styles.cardDescription}>
                      {alert.description}
                    </Text>
                    <Text style={styles.cardTime}>{alert.time}</Text>
                  </View>

                  {!alert.read && <View style={styles.unreadDot} />}
                </Pressable>
              );
            })
          )}
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

    content: {
      width: '100%',
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center',
    },

    /* CABEÇALHO */

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
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

    markRead: {
      fontFamily: fonts.bold,
      fontSize: s(12),
      color: colors.primary,
      marginTop: s(2),
    },

    markReadDisabled: {
      opacity: 0.4,
    },

    /* FILTRO POR PET */

    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: s(16),
    },

    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      height: s(36),
      paddingHorizontal: s(12),
      borderRadius: s(18),
      backgroundColor: ui.card,
      borderWidth: 1,
      borderColor: ui.cardBorder,
    },

    chipSelected: {
      backgroundColor: ui.tealSoft,
    },

    chipText: {
      fontFamily: fonts.bold,
      fontSize: s(12),
      color: colors.primary,
    },

    chipTextWithAvatar: {
      marginLeft: s(8),
    },

    chipTextSelected: {
      fontFamily: fonts.extrabold,
    },

    /* TODOS / NÃO LIDOS */

    pillsRow: {
      flexDirection: 'row',
      gap: s(8),
      marginTop: s(10),
      marginBottom: s(16),
    },

    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      height: s(36),
      paddingHorizontal: s(14),
      borderRadius: s(18),
      backgroundColor: '#E8F1F0',
    },

    pillSelected: {
      backgroundColor: colors.primary,
    },

    pillText: {
      fontFamily: fonts.bold,
      fontSize: s(12),
      color: colors.primary,
    },

    pillTextSelected: {
      color: '#FFFFFF',
    },

    pillCount: {
      fontFamily: fonts.bold,
      fontSize: s(12),
      color: '#8AA09E',
      marginLeft: s(8),
    },

    pillCountSelected: {
      color: 'rgba(255,255,255,0.8)',
    },

    /* CARDS */

    card: {
      flexDirection: 'row',
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      padding: s(14),
      marginBottom: s(12),
    },

    cardUnread: {
      borderColor: '#9FCFC6',
    },

    cardRead: {
      borderColor: '#D2E8E3',
    },

    iconBox: {
      width: s(46),
      height: s(46),
      borderRadius: s(12),
      alignItems: 'center',
      justifyContent: 'center',
    },

    cardContent: {
      flex: 1,
      marginLeft: s(12),
      paddingRight: s(14),
    },

    petChip: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: ui.tealSoft,
      borderRadius: s(10),
      paddingVertical: s(2),
      paddingLeft: s(3),
      paddingRight: s(8),
      marginBottom: s(6),
    },

    petChipText: {
      fontFamily: fonts.extrabold,
      fontSize: s(10),
      color: colors.primary,
      marginLeft: s(5),
    },

    cardTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.text,
    },

    cardDescription: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#5C6F6D',
      marginTop: s(2),
    },

    cardTime: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: '#8A9B99',
      marginTop: s(6),
    },

    unreadDot: {
      position: 'absolute',
      top: s(14),
      right: s(14),
      width: s(8),
      height: s(8),
      borderRadius: s(4),
      backgroundColor: ui.intense,
    },

    /* ESTADO VAZIO */

    empty: {
      alignItems: 'center',
      paddingVertical: s(40),
    },

    emptyIcon: {
      width: s(56),
      height: s(56),
      borderRadius: s(16),
      backgroundColor: ui.tealSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s(12),
    },

    emptyTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(16),
      color: colors.text,
    },

    emptyText: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: ui.muted,
      marginTop: s(4),
      textAlign: 'center',
    },
  });
}

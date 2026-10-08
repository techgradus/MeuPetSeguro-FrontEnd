import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { Layout, useLayout } from '@/hooks/useLayout';

export type TabId = 'home' | 'pet' | 'alerts' | 'reports' | 'settings';

type Tab = {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  notification?: boolean;
  /** Rota da aba. Preencha conforme as telas forem sendo criadas. */
  route?: Href;
};

const TABS: Tab[] = [
  {
    id: 'home',
    label: 'Início',
    icon: 'home-outline',
    activeIcon: 'home',
    route: '/home',
  },
  {

  id: 'pet',
  label: 'Meu Pet',
  icon: 'paw-outline',
  activeIcon: 'paw',
  route: '/meus-pets',
    // TODO: route: '/meu-pet',
  },
  {
    id: 'alerts',
    label: 'Alertas',
    icon: 'notifications-outline',
    notification: true,
    // TODO: route: '/alertas',
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: 'analytics-outline',
    // TODO: route: '/relatorios',
  },
  {
    id: 'settings',
    label: 'Config',
    icon: 'settings-outline',
    // TODO: route: '/config',
  },
];

export default function BottomNav({ active }: { active: TabId }) {
  const router = useRouter();
  const layout = useLayout();
  const { s } = layout;

  const styles = useMemo(
    () => makeStyles(layout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.frameWidth, layout.insetBottom, layout.isWeb],
  );

  return (
    <View style={styles.bottomNavigation}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[styles.bottomItem, isActive && styles.bottomItemActive]}
            onPress={() => {
              if (!isActive && tab.route) router.navigate(tab.route);
            }}
          >
            <View style={styles.bottomIconContainer}>
              <Ionicons
                name={isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
                size={s(24)}
                color={isActive ? colors.primary : '#7E8C8A'}
              />

              {tab.notification && <View style={styles.bottomNotification} />}
            </View>

            <Text
              style={[styles.bottomLabel, isActive && styles.bottomLabelActive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function makeStyles({ s, insetBottom, navHeight }: Layout) {
  return StyleSheet.create({
    bottomNavigation: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: navHeight,
      paddingBottom: insetBottom,
      backgroundColor: '#FDFEFB',
      borderTopWidth: 1,
      borderTopColor: '#B5BFBD',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: s(4),
    },

    bottomItem: {
      flex: 1,
      maxWidth: s(76),
      height: s(56),
      marginHorizontal: s(2),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: s(12),
    },

    bottomItemActive: {
      backgroundColor: ui.tealSoft,
    },

    bottomIconContainer: {
      position: 'relative',
      height: s(26),
      justifyContent: 'center',
    },

    bottomNotification: {
      position: 'absolute',
      right: -2,
      top: 1,
      width: s(7),
      height: s(7),
      borderRadius: s(4),
      backgroundColor: '#7E8C8A',
    },

    bottomLabel: {
      fontFamily: fonts.bold,
      fontSize: s(11),
      color: '#7E8C8A',
      marginTop: 2,
    },

    bottomLabelActive: {
      color: colors.primary,
    },
  });
}

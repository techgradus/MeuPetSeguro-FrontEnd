import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/constants/petTheme';

export type TabRoute = 'home' | 'meus-pets' | 'alertas' | 'relatorios' | 'config';

type Props = {
  active: TabRoute;
  onPress: (route: TabRoute) => void;
};

type Icon = keyof typeof Ionicons.glyphMap;

// Mesmas abas e visual da barra da Home.
const tabs: { route: TabRoute; label: string; icon: Icon; activeIcon: Icon; notification?: boolean }[] = [
  { route: 'home', label: 'Início', icon: 'home-outline', activeIcon: 'home' },
  { route: 'meus-pets', label: 'Meu Pet', icon: 'paw-outline', activeIcon: 'paw' },
  { route: 'alertas', label: 'Alertas', icon: 'notifications-outline', activeIcon: 'notifications', notification: true },
  { route: 'relatorios', label: 'Relatórios', icon: 'analytics-outline', activeIcon: 'analytics' },
  { route: 'config', label: 'Config', icon: 'settings-outline', activeIcon: 'settings' },
];

export function BottomTabBar({ active, onPress }: Props) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const selected = active === tab.route;
        return (
          <Pressable
            key={tab.route}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => !selected && onPress(tab.route)}
            style={[styles.item, selected && styles.itemActive]}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={selected ? tab.activeIcon : tab.icon}
                size={24}
                color={selected ? colors.primary : '#7E8C8A'}
              />
              {tab.notification && <View style={styles.dot} />}
            </View>
            <Text style={[styles.label, selected && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 76,
    backgroundColor: '#FDFEFB',
    borderTopWidth: 1,
    borderTopColor: '#B5BFBD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  item: { width: 68, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  itemActive: { backgroundColor: '#C6F1EC' },
  iconBox: { position: 'relative', height: 26, justifyContent: 'center' },
  dot: {
    position: 'absolute', right: -2, top: 1, width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#7E8C8A',
  },
  label: { fontFamily: fonts.bold, fontSize: 11, color: '#7E8C8A', marginTop: 2 },
  labelActive: { color: colors.primary },
});

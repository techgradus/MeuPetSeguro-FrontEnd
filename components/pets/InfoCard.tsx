import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '@/constants/petTheme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  caption?: string;        // texto pequeno acima do título
  badge?: string;
  badgeOk?: boolean;
  onPress?: () => void;
};

export function InfoCard({ icon, title, subtitle, caption, badge, badgeOk = true, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={onPress ? 0.85 : 1} onPress={onPress} style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.texts}>
        {!!caption && <Text style={styles.caption}>{caption}</Text>}
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {!!badge && (
        <View style={[styles.badge, !badgeOk && styles.badgeOff]}>
          <Text style={[styles.badgeText, !badgeOk && styles.badgeTextOff]}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 12,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#CDEEE8', backgroundColor: '#FBFFFD',
  },
  icon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  texts: { flex: 1 },
  caption: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  subtitle: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  badge: { backgroundColor: colors.primaryLight, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  badgeOff: { backgroundColor: colors.border },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.primary },
  badgeTextOff: { color: colors.textMuted },
});

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fonts, radius, shadow } from '@/constants/petTheme';

type Props = { title: string; onPress: () => void; loading?: boolean; disabled?: boolean };

export function Button({ title, onPress, loading, disabled }: Props) {
  const blocked = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={blocked}
      style={[styles.button, blocked && styles.blocked]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56, borderRadius: radius.lg, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadow,
  },
  blocked: { opacity: 0.7 },
  text: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
});

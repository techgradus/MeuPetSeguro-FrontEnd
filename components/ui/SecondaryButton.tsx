import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fonts, radius } from '@/constants/petTheme';

type Props = { title: string; onPress: () => void; disabled?: boolean };

/** Botão secundário (fundo branco, borda suave e texto verde). */
export function SecondaryButton({ title, onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && { opacity: 0.6 }]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52, borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  text: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
});

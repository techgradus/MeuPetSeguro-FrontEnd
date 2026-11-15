import { themed } from '@/constants/darkTheme';
import { colors, fonts, radius } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = { title: string; onPress: () => void; loading?: boolean; disabled?: boolean };

export function DangerButton({ title, onPress, loading, disabled }: Props) {
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const blocked = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      style={[styles.button, blocked && { opacity: 0.6 }]}
    >
      {loading ? (
        <ActivityIndicator color={colors.error} />
      ) : (
        <>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create(themed({
    button: {
      height: 52, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1.5,
      borderColor: colors.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    text: { fontFamily: fonts.bold, fontSize: 14, color: colors.error },
  }, dark));

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { themed } from '@/constants/darkTheme';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';

type Props = { message: string; type?: 'success' | 'error' };

export function FeedbackBanner({ message, type = 'success' }: Props) {
  const { dark, c } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const ok = type === 'success';
  const tint = ok ? colors.success : colors.error;
  return (
    <View style={[styles.box, { backgroundColor: ok ? colors.successLight : colors.errorLight }]}>
      <Ionicons name={ok ? 'checkmark-circle' : 'alert-circle'} size={22} color={tint} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  box: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md,
    borderRadius: radius.md, marginBottom: spacing.md,
  },
  text: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.text },
}, dark));

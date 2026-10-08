import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '@/constants/petTheme';

type Props = TextInputProps & { label: string; suffix?: string; error?: string | null };

export function LabeledField({ label, suffix, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
        />
        {!!suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  box: {
    minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: '#CDEEE8', backgroundColor: '#FBFFFD',
  },
});

const styles = StyleSheet.create({
  wrapper: { flex: 1, marginBottom: 14 },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, marginBottom: 6 },
  field: { ...fieldStyles.box },
  fieldError: { borderColor: colors.error, backgroundColor: colors.errorLight },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.medium, fontSize: 14, color: colors.text, paddingVertical: 10 },
  suffix: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted, marginLeft: 8, flexShrink: 0 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  errorText: { fontFamily: fonts.medium, fontSize: 11, color: colors.error, flex: 1 },
});

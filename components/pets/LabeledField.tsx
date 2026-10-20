import { themed } from '@/constants/darkTheme';
import { colors, fonts, radius } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & { label: string; suffix?: string; error?: string | null };

export function LabeledField({ label, suffix, error, style, ...rest }: Props) {
  const { dark, tx } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={tx(colors.textMuted)}
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

/** Caixa do campo (claro). Usada pelo SelectField, que deve preferir `useFieldBox()`. */
export const fieldBox = {
  minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
  borderRadius: radius.md, borderWidth: 1.5, borderColor: '#CDEEE8', backgroundColor: '#FBFFFD',
} as const;

/** Mantido para quem já importava `fieldStyles` (tema claro). */
export const fieldStyles = StyleSheet.create({ box: { ...fieldBox } });

/** Caixa do campo já adaptada ao tema atual. */
export function useFieldBox() {
  const { dark } = useAppTheme();
  return useMemo(() => StyleSheet.create(themed({ box: { ...fieldBox } }, dark)).box, [dark]);
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create(themed({
    wrapper: { flex: 1, marginBottom: 14 },
    label: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, marginBottom: 6 },
    field: { ...fieldBox },
    fieldError: { borderColor: colors.error, backgroundColor: colors.errorLight },
    input: { flex: 1, minWidth: 0, fontFamily: fonts.medium, fontSize: 14, color: colors.text, paddingVertical: 10 },
    suffix: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted, marginLeft: 8, flexShrink: 0 },
    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
    errorText: { fontFamily: fonts.medium, fontSize: 11, color: colors.error, flex: 1 },
  }, dark));

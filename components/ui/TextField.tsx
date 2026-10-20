import { mapColor, themed } from '@/constants/darkTheme';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

type Props = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  isPassword?: boolean;
};

export function TextField({ label, icon, error, isPassword, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const { dark, bg, tx } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);

  const borderColor = mapColor(
    error ? colors.error : focused ? colors.primary : colors.border,
    'border',
    dark,
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, { borderColor }, error ? { backgroundColor: bg(colors.errorLight) } : null]}>
        <Ionicons name={icon} size={20} color={error ? colors.error : colors.primary} />
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={tx(colors.textMuted)}
          secureTextEntry={isPassword && hidden}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={22} color={tx(colors.textMuted)} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create(themed({
    wrapper: { marginBottom: spacing.md },
    label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text, marginBottom: 6 },
    field: {
      flexDirection: 'row', alignItems: 'center', gap: 10, height: 54,
      paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1.5,
      backgroundColor: colors.surface,
    },
    input: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text },
    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    errorText: { fontFamily: fonts.medium, fontSize: 12, color: colors.error },
  }, dark));

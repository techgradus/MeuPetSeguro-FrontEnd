import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { fieldStyles } from './LabeledField';

type Props<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

export function SelectField<T extends string>({ label, value, options, onChange }: Props<T>) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={fieldStyles.box} activeOpacity={0.8} onPress={() => setOpen(true)}>
        <Text style={styles.value}>{value}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.option}
                onPress={() => { onChange(opt); setOpen(false); }}
              >
                <Text style={[styles.optionText, opt === value && styles.optionActive]}>{opt}</Text>
                {opt === value && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, marginBottom: 14 },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, marginBottom: 6 },
  value: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,43,43,0.4)', justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  sheetTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  optionText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  optionActive: { fontFamily: fonts.bold, color: colors.primary },
});

import { DeviceFlowLayout, DeviceStepHeader } from '@/components/devices/DeviceFlowLayout';
import { Button } from '@/components/ui/Button';
import { themed } from '@/constants/darkTheme';
import { DEVICE_TYPES, DeviceType } from '@/constants/deviceTypes';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DeviceTypeScreen() {
  const router = useRouter();
  const { dark, bg } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const [type, setType] = useState<DeviceType | undefined>(newDeviceDraft.get().type);

  const next = () => {
    if (!type) return;
    newDeviceDraft.set({ type });
    router.push('/novo-dispositivo/preparar');
  };

  return (
    <DeviceFlowLayout step={1} onBack={() => router.back()}>
      <DeviceStepHeader
        kicker="Escolha o tipo"
        title="Qual dispositivo você quer conectar?"
        subtitle="Selecione uma opção para ver as instruções certas."
      />

      <View style={styles.list}>
        {DEVICE_TYPES.map((item) => {
          const selected = item.type === type;
          return (
            <TouchableOpacity
              key={item.type}
              activeOpacity={0.85}
              onPress={() => setType(item.type)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <View style={[styles.icon, { backgroundColor: bg(item.softColor) }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.texts}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button title="Continuar" onPress={next} disabled={!type} />
    </DeviceFlowLayout>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  list: { gap: 12, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
  },
  cardSelected: { borderColor: colors.primary },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  description: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  radio: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
}, dark));

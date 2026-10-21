import { DeviceFlowLayout, DeviceStepHeader } from '@/components/devices/DeviceFlowLayout';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { themed } from '@/constants/darkTheme';
import { getDeviceType } from '@/constants/deviceTypes';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function DeviceDoneScreen() {
  const router = useRouter();
  const { dark, bg } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const info = getDeviceType(newDeviceDraft.get().type ?? 'colar');

  const finish = () => {
    const backTo = newDeviceDraft.get().origin === 'config' ? '/config' : '/meus-pets';
    newDeviceDraft.reset();
    // volta ao início da pilha e abre a tela de onde o assistente foi aberto
    if (router.canDismiss()) router.dismissAll();
    router.replace(backTo);
  };

  // Recomeça o assistente para o mesmo pet (um pet pode ter colar, pote de comida e pote de água)
  const addAnother = () => {
    const { petId, origin } = newDeviceDraft.get();
    newDeviceDraft.reset();
    newDeviceDraft.set({ petId, origin });
    router.replace('/novo-dispositivo');
  };

  return (
    <DeviceFlowLayout step={5} onBack={finish}>
      <View style={styles.center}>
        <View style={styles.circle}>
          <Ionicons name="wifi" size={46} color={colors.primary} />
        </View>
      </View>

      <DeviceStepHeader
        center
        kicker="Conexão concluída"
        title="Dispositivo conectado!"
        subtitle="A conexão está ativa e pronta para acompanhar seu pet de qualquer lugar."
      />

      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: bg(info.softColor) }]}>
          <Ionicons name={info.icon} size={20} color={info.color} />
        </View>
        <View style={styles.texts}>
          <Text style={styles.label}>{info.label}</Text>
          <Text style={styles.description}>{info.description}</Text>
        </View>
        <Ionicons name="wifi" size={20} color={colors.primary} />
      </View>

      <View style={styles.actions}>
        <Button title="Concluir" onPress={finish} />
        <SecondaryButton title="Adicionar outro dispositivo" onPress={addAnother} />
      </View>
    </DeviceFlowLayout>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  center: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.md },
  circle: {
    width: 130, height: 130, borderRadius: 65, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.lg,
  },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  description: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  actions: { gap: 12 },
}, dark));

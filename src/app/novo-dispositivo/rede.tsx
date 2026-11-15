import { DeviceFlowLayout, DeviceStepHeader } from '@/components/devices/DeviceFlowLayout';
import { Button } from '@/components/ui/Button';
import { themed } from '@/constants/darkTheme';
import { portalNetworkName } from '@/constants/deviceSetup';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Etapa "Wi-Fi": o app NÃO envia o Wi-Fi ao dispositivo. Sem rede salva, o próprio dispositivo abre
 * a rede MEUPET-<ID> com uma página de configuração (portal): a pessoa entra nela, escolhe a rede da
 * casa (a lista vem do dispositivo) e digita a senha. Depois ele conecta sozinho e o app só espera.
 */
export default function WifiPortalScreen() {
  const router = useRouter();
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);

  const draft = newDeviceDraft.get();
  const networkName = portalNetworkName(draft.registered?.code ?? draft.deviceCode);

  const steps = [
    <>No celular, abra os ajustes de Wi-Fi e conecte na rede <Text style={styles.bold}>{networkName}</Text>.</>,
    <>A página de configuração abre sozinha. Se não abrir, acesse <Text style={styles.bold}>192.168.4.1</Text> no navegador.</>,
    <>Escolha o Wi-Fi da sua casa, digite a senha e salve.</>,
    <>Volte para o app. O dispositivo reinicia e se conecta sozinho.</>,
  ];

  return (
    <DeviceFlowLayout step={3} onBack={() => router.back()}>
      <DeviceStepHeader
        kicker="Wi-Fi da casa"
        title="Conecte o dispositivo ao Wi-Fi"
        subtitle="A configuração é feita no próprio dispositivo, por uma página que ele mesmo abre."
      />

      <View style={styles.networkCard}>
        <View style={styles.networkIcon}>
          <Ionicons name="wifi" size={22} color="#fff" />
        </View>
        <View style={styles.networkTexts}>
          <Text style={styles.networkLabel}>Rede do dispositivo</Text>
          <Text style={styles.networkName} selectable>{networkName}</Text>
          <Text style={styles.networkHint}>Sem senha. Só existe enquanto o dispositivo não tem Wi-Fi salvo.</Text>
        </View>
      </View>

      <View style={styles.steps}>
        {steps.map((content, index) => (
          <View key={index} style={[styles.stepRow, index > 0 && styles.stepRowBorder]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{content}</Text>
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.noteText}>
          Escolha uma rede de 2,4 GHz: o dispositivo não conecta em redes que só existem em 5 GHz. Se a senha
          estiver errada, a rede {networkName} aparece de novo para você tentar outra vez.
        </Text>
      </View>

      <Button title="Já configurei o Wi-Fi" onPress={() => router.push('/novo-dispositivo/conectando')} />

    </DeviceFlowLayout>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  networkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.primary, marginBottom: spacing.lg,
  },
  networkIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  networkTexts: { flex: 1 },
  networkLabel: { fontFamily: fonts.bold, fontSize: 11, color: colors.textMuted },
  networkName: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.text, marginTop: 2 },
  networkHint: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 16, color: colors.textMuted, marginTop: 4 },
  steps: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, marginBottom: spacing.lg,
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14 },
  stepRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  stepNumber: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumberText: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  stepText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.text },
  bold: { fontFamily: fonts.bold },
  note: {
    flexDirection: 'row', gap: 8, backgroundColor: colors.primaryLight, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg,
  },
  noteText: { flex: 1, fontFamily: fonts.medium, fontSize: 11, lineHeight: 17, color: colors.textMuted },
}, dark));

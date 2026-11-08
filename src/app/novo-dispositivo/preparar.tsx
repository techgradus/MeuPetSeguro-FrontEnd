import { DeviceFlowLayout, DeviceStepHeader } from '@/components/devices/DeviceFlowLayout';
import { Button } from '@/components/ui/Button';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { TextField } from '@/components/ui/TextField';
import { themed } from '@/constants/darkTheme';
import { getSetupOption, normalizeSetupCode, validateSetupCode } from '@/constants/deviceSetup';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { errorMessage } from '@/services/api';
import { deviceService } from '@/services/deviceService';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PrepareDeviceScreen() {
  const router = useRouter();
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const option = getSetupOption(newDeviceDraft.get().kind ?? 'colar');
  const [code, setCode] = useState(newDeviceDraft.get().deviceCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // O erro de formato só aparece depois que a pessoa começa a digitar
  const codeError = code.trim() ? validateSetupCode(option.kind, code) : null;
  const canContinue = !!code.trim() && !codeError && !loading;

  /**
   * Vincula o dispositivo ao pet já aqui: assim o servidor já aceita as mensagens dele quando ele
   * ligar no Wi-Fi, e qualquer problema com o código (já em uso, pet já tem um) aparece antes da
   * pessoa configurar a rede.
   */
  const next = async () => {
    const { petId, kind, registered } = newDeviceDraft.get();
    const normalized = normalizeSetupCode(code);
    if (!petId || !kind || validateSetupCode(kind, normalized)) return;

    setLoading(true);
    setError(null);

    try {
      const sameAsBefore =
        !!registered && registered.petId === petId && registered.kind === kind && registered.code === normalized;

      if (!sameAsBefore) {
        // Voltou e trocou o código ou o pet: o vínculo anterior deixa de valer
        if (registered) {
          for (const device of registered.devices) {
            await deviceService.remove(registered.petId, device.id).catch(() => undefined);
          }
          newDeviceDraft.set({ registered: undefined });
        }

        const devices = await deviceService.registerSetup(petId, kind, normalized);
        newDeviceDraft.set({ deviceCode: normalized, registered: { petId, kind, code: normalized, devices } });
      }

      router.push('/novo-dispositivo/rede');
    } catch (e) {
      setError(errorMessage(e, 'Não foi possível vincular o dispositivo. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeviceFlowLayout step={2} onBack={() => router.back()}>
      <DeviceStepHeader
        kicker="Prepare o dispositivo"
        title={option.turnOn}
        subtitle="Ligue o dispositivo e encontre o código impresso na etiqueta."
      />

      <View style={styles.illustration}>
        <View style={styles.powerTile}>
          <Ionicons name="power" size={34} color={colors.primary} />
        </View>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => <View key={i} style={styles.dot} />)}
        </View>
        <View style={styles.wifiTile}>
          <Ionicons name="wifi" size={34} color="#fff" />
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoHeader}>
          <MaterialCommunityIcons name="router-wireless" size={20} color={colors.primary} />
          <Text style={styles.infoTitle}>O dispositivo se conecta sozinho à internet</Text>
        </View>
        <Text style={styles.infoText}>
          Na próxima etapa você configura o Wi-Fi da casa direto no dispositivo. Depois disso ele envia os dados
          pela internet, e o celular não precisa estar na mesma rede para acompanhar seu pet.
        </Text>
      </View>

      {!!error && <FeedbackBanner type="error" message={error} />}

      <TextField
        label="Código do dispositivo"
        icon="qr-code-outline"
        placeholder={`Ex.: ${option.codeExample}`}
        autoCapitalize="characters"
        autoCorrect={false}
        value={code}
        onChangeText={(value) => {
          setCode(value);
          setError(null);
        }}
        error={codeError ?? undefined}
      />
      <Text style={styles.codeHint}>
        {option.kind === 'estacao'
          ? 'A estação tem um só código na etiqueta, que vale para os dois potes (comida e água).'
          : 'O código fica na etiqueta do dispositivo ou na embalagem.'}
      </Text>

      <Button title="Vincular dispositivo" onPress={next} disabled={!canContinue} loading={loading} />
    </DeviceFlowLayout>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  illustration: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.lg },
  powerTile: {
    width: 76, height: 76, borderRadius: radius.lg, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 4, marginHorizontal: 8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border },
  wifiTile: {
    width: 76, height: 76, borderRadius: radius.lg, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  info: {
    backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  codeHint: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginBottom: spacing.lg, marginTop: -spacing.sm },
  infoText: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 17, color: colors.textMuted },
}, dark));

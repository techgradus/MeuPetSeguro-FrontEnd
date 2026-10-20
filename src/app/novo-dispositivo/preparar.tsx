import { DeviceFlowLayout, DeviceStepHeader } from '@/components/devices/DeviceFlowLayout';
import { Button } from '@/components/ui/Button';
import { themed } from '@/constants/darkTheme';
import { getDeviceType } from '@/constants/deviceTypes';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PrepareDeviceScreen() {
  const router = useRouter();
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const info = getDeviceType(newDeviceDraft.get().type ?? 'colar');

  return (
    <DeviceFlowLayout step={2} onBack={() => router.back()}>
      <DeviceStepHeader
        kicker="Prepare o dispositivo"
        title={info.turnOn}
        subtitle="Mantenha o dispositivo próximo ao roteador durante a configuração."
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
          <Text style={styles.infoTitle}>A conexão é feita pelo Wi-Fi da casa</Text>
        </View>
        <Text style={styles.infoText}>
          Não usamos Bluetooth, pois seu alcance é curto. Conecte o dispositivo à mesma rede Wi-Fi da
          sua casa para acompanhar seu pet mesmo estando fora.
        </Text>
      </View>

      <Button title="O dispositivo está ligado" onPress={() => router.push('/novo-dispositivo/rede')} />
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
  infoText: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 17, color: colors.textMuted },
}, dark));

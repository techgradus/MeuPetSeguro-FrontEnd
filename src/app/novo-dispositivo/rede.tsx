import { DeviceFlowLayout, DeviceStepHeader } from '@/components/devices/DeviceFlowLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { themed } from '@/constants/darkTheme';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { deviceService, WifiNetwork } from '@/services/deviceService';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WifiNetworkScreen() {
  const router = useRouter();
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const [networks, setNetworks] = useState<WifiNetwork[] | null>(null);
  const [ssid, setSsid] = useState<string | undefined>(newDeviceDraft.get().ssid);
  const [password, setPassword] = useState(newDeviceDraft.get().password);

  useEffect(() => {
    deviceService.scanNetworks().then(setNetworks);
  }, []);

  const canConnect = !!ssid && password.length > 0;

  const connect = () => {
    if (!canConnect) return;
    newDeviceDraft.set({ ssid, password });
    router.push('/novo-dispositivo/conectando');
  };

  return (
    <DeviceFlowLayout step={3} onBack={() => router.back()}>
      <DeviceStepHeader
        kicker="Rede da casa"
        title="Escolha uma rede Wi-Fi"
        subtitle="Selecione a rede e informe a senha para conectar com segurança."
      />

      {networks === null ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
      ) : (
        <View style={styles.list}>
          {networks.map((net) => {
            const selected = net.ssid === ssid;
            return (
              <TouchableOpacity
                key={net.ssid}
                activeOpacity={0.85}
                onPress={() => setSsid(net.ssid)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.network, selected && styles.networkSelected]}
              >
                <Ionicons name="wifi" size={20} color={colors.primary} />
                <View style={styles.texts}>
                  <Text style={styles.ssid}>{net.ssid}</Text>
                  <Text style={styles.signal}>{net.signal}</Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TextField
        label="Senha"
        icon="lock-closed-outline"
        placeholder="Senha da rede"
        isPassword
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ marginTop: spacing.sm }}>
        <Button title="Conectar" onPress={connect} disabled={!canConnect} />
      </View>
    </DeviceFlowLayout>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  list: { gap: 12, marginBottom: spacing.lg },
  network: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
  },
  networkSelected: { borderColor: colors.primary, backgroundColor: '#FBFFFD' },
  texts: { flex: 1 },
  ssid: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  signal: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 1 },
}, dark));

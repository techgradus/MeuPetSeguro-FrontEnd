import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DeviceFlowLayout } from '@/components/devices/DeviceFlowLayout';
import { Button } from '@/components/ui/Button';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { errorMessage } from '@/services/api';
import { deviceService } from '@/services/deviceService';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';

const STEPS = ['Dispositivo encontrado', 'Rede identificada', 'Finalizando conexão'];

/** Anel girando com o ícone de Wi-Fi no centro. */
function ConnectingRing() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.ringBox}>
      <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
      <View style={styles.ringInner}>
        <Ionicons name="wifi" size={46} color={colors.primary} />
      </View>
    </View>
  );
}

export default function ConnectingScreen() {
  const router = useRouter();
  const draft = newDeviceDraft.get();
  const [done, setDone] = useState(0); // quantos itens do checklist já foram concluídos
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const finished = useRef(false);

  const goToDone = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    router.replace('/novo-dispositivo/concluido');
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    const t1 = setTimeout(() => setDone(1), 1200);
    const t2 = setTimeout(() => setDone(2), 2400);
    let t3: ReturnType<typeof setTimeout>;

    (async () => {
      try {
        await deviceService.connect(draft.type ?? 'colar', draft.ssid ?? '', draft.password);
        if (!draft.petId || !draft.type) throw new Error('Escolha o pet e o tipo do dispositivo.');
        await deviceService.register(draft.petId, draft.type, draft.deviceCode);
        if (cancelled) return;
        setDone(3);
        t3 = setTimeout(goToDone, 800);
      } catch (e) {
        if (cancelled) return;
        setError(errorMessage(e, 'Não foi possível vincular o dispositivo. Tente novamente.'));
      }
    })();

    return () => { cancelled = true; clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = () => {
    setError(null);
    setDone(0);
    setAttempt((a) => a + 1);
  };

  return (
    <DeviceFlowLayout step={4} onBack={() => router.back()}>
      <View style={styles.center}>
        <ConnectingRing />
        <Text style={styles.kicker}>SÓ UM INSTANTE</Text>
        <Text style={styles.title}>Conectando ao dispositivo...</Text>
        <Text style={styles.subtitle}>
          Estamos configurando o acesso pela rede {draft.ssid ?? 'Wi-Fi'}.
        </Text>
      </View>

      <View style={styles.checklist}>
        {STEPS.map((label, index) => {
          const complete = done > index;
          return (
            <View key={label} style={[styles.checkRow, index > 0 && styles.checkRowBorder]}>
              {complete ? (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              ) : (
                <View style={styles.pending} />
              )}
              <Text style={styles.checkLabel}>{label}</Text>
            </View>
          );
        })}
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <FeedbackBanner type="error" message={error} />
          <Button title="Tentar novamente" onPress={retry} />
          <TouchableOpacity
            onPress={() => router.navigate('/novo-dispositivo/preparar')}
            style={styles.skip}
            hitSlop={8}
          >
            <Text style={styles.skipText}>Corrigir o código do dispositivo</Text>
          </TouchableOpacity>
        </View>
      )}
    </DeviceFlowLayout>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginBottom: spacing.lg },
  ringBox: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  ring: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 10,
    borderColor: colors.primaryLight, borderTopColor: colors.primary, borderRightColor: colors.primary,
  },
  ringInner: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  kicker: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, color: colors.textMuted },
  title: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.text, marginTop: 6, textAlign: 'center' },
  subtitle: {
    fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.textMuted,
    textAlign: 'center', marginTop: 8, maxWidth: 280,
  },
  checklist: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  checkRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  pending: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: colors.primary },
  checkLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  errorBox: { marginTop: spacing.lg },
  skip: { alignSelf: 'center', marginTop: spacing.md },
  skipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
});

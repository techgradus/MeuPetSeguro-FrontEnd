import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NewPetLayout, StepKicker, StepSubtitle, StepTitle } from '@/components/pets/NewPetLayout';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { newPetDraft } from '@/services/newPetDraft';
import { petService } from '@/services/petService';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';

/** Ilustração do colar/pote inteligente com Wi-Fi. */
function DeviceIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.deviceOuter}>
        <View style={styles.deviceInner}>
          <Ionicons name="wifi" size={30} color={colors.primary} />
        </View>
      </View>
      <View style={styles.deviceButton} />
    </View>
  );
}

export default function ConnectDeviceScreen() {
  const router = useRouter();
  const draft = newPetDraft.get();
  const [saving, setSaving] = useState(false);

  // "Vincular depois": cadastra o pet sem dispositivo e vai para a etapa final
  const linkLater = async () => {
    try {
      setSaving(true);
      await petService.add(draft);
      router.replace('/novo-pet/concluido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <NewPetLayout step={2} onBack={() => router.back()}>
      <StepKicker>CASA CONECTADA</StepKicker>
      <StepTitle>Conecte o dispositivo de {draft.name || 'seu pet'}</StepTitle>
      <StepSubtitle>
        O dispositivo transforma os cuidados diários em informações que você acompanha à distância.
      </StepSubtitle>

      <View style={styles.card}>
        <DeviceIllustration />
        <Text style={styles.cardTitle}>Próximo passo</Text>
        <Text style={styles.cardText}>
          Ligue o colar ou pote inteligente e tenha a senha do Wi-Fi da casa em mãos.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Conectar agora" onPress={() => router.push('/novo-pet/vinculo')} disabled={saving} />
        <SecondaryButton title="Vincular depois" onPress={linkLater} disabled={saving} />
      </View>
    </NewPetLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 40, paddingHorizontal: spacing.lg, alignItems: 'center', marginBottom: spacing.lg,
  },
  illustration: { alignItems: 'center', marginBottom: spacing.md },
  deviceOuter: {
    width: 170, height: 96, borderRadius: 48, backgroundColor: '#5BC0B8',
    alignItems: 'center', justifyContent: 'center',
  },
  deviceInner: {
    width: 100, height: 62, borderRadius: 30, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  deviceButton: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primary,
    marginTop: -16, borderWidth: 3, borderColor: colors.surface,
  },
  cardTitle: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.text, marginTop: 8 },
  cardText: {
    fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.textMuted,
    textAlign: 'center', marginTop: 6, maxWidth: 260,
  },
  actions: { gap: 12 },
});

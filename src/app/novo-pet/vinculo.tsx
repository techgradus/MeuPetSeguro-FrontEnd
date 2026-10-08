import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NewPetLayout, StepKicker, StepSubtitle, StepTitle } from '@/components/pets/NewPetLayout';
import { Button } from '@/components/ui/Button';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { newPetDraft } from '@/services/newPetDraft';
import { petService } from '@/services/petService';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';

export default function LinkDeviceScreen() {
  const router = useRouter();
  const draft = newPetDraft.get();
  const [saving, setSaving] = useState(false);

  const openAssistant = () =>
    // TODO: abrir o assistente de conexão do dispositivo (Wi-Fi/MQTT) quando for desenvolvido
    Alert.alert('Assistente de conexão', 'O assistente será integrado nas próximas etapas.');

  // "Vincular depois": finaliza o cadastro e vai para a tela de pet cadastrado
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
    <NewPetLayout step={3} onBack={() => router.back()}>
      <StepKicker>VÍNCULO DO DISPOSITIVO</StepKicker>
      <StepTitle>Tudo pronto para conectar</StepTitle>
      <StepSubtitle>Você seguirá pelo assistente de conexão e voltará aqui quando terminar.</StepSubtitle>

      <View style={styles.info}>
        <MaterialCommunityIcons name="router-wireless" size={34} color={colors.primary} />
        <View style={styles.infoTexts}>
          <Text style={styles.infoTitle}>Conexão por Wi-Fi</Text>
          <Text style={styles.infoText}>
            Use a rede da sua casa para acompanhar {draft.name || 'seu pet'} de qualquer lugar.
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Abrir assistente" onPress={openAssistant} disabled={saving} />
        <SecondaryButton title="Vincular depois" onPress={linkLater} disabled={saving} />
      </View>
    </NewPetLayout>
  );
}

const styles = StyleSheet.create({
  info: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.primaryLight,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg,
  },
  infoTexts: { flex: 1 },
  infoTitle: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  infoText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 17, color: colors.primary, marginTop: 2 },
  actions: { gap: 12 },
});

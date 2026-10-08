import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NewPetLayout } from '@/components/pets/NewPetLayout';
import { Button } from '@/components/ui/Button';
import { newPetDraft } from '@/services/newPetDraft';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';

/** Foto do pet ou, na falta dela, a patinha. */
function PetTile({ uri, size, iconSize, borderRadius }: { uri?: string; size: number; iconSize: number; borderRadius: number }) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Ionicons name="paw-outline" size={iconSize} color={colors.primary} />
      )}
    </View>
  );
}

export default function NewPetDoneScreen() {
  const router = useRouter();
  const draft = newPetDraft.get();

  const years = draft.age === '1' ? 'ano' : 'anos';
  const summary = `${draft.breed} · ${draft.age} ${years} · ${draft.weight} kg`;

  const goToMyPets = () => {
    newPetDraft.reset();
    // volta ao início da pilha e abre Meus Pets já com o novo pet na lista
    if (router.canDismiss()) router.dismissAll();
    router.replace('/meus-pets');
  };

  return (
    <NewPetLayout step={4} onBack={goToMyPets}>
      <View style={styles.center}>
        <View style={styles.bigWrap}>
          <PetTile uri={draft.photoUri} size={108} iconSize={46} borderRadius={30} />
          <View style={styles.check}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        </View>

        <Text style={styles.kicker}>PET CADASTRADO</Text>
        <Text style={styles.title}>{draft.name} já faz parte da família!</Text>
        <Text style={styles.subtitle}>
          O perfil está pronto e pode receber novos dispositivos quando você quiser.
        </Text>
      </View>

      <View style={styles.card}>
        <PetTile uri={draft.photoUri} size={70} iconSize={30} borderRadius={20} />
        <View style={styles.cardTexts}>
          <Text style={styles.cardKicker}>NOVO PERFIL</Text>
          <Text style={styles.cardName}>{draft.name}</Text>
          <Text style={styles.cardSummary}>{summary}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pronto</Text>
        </View>
      </View>

      <Button title="Ver meus pets" onPress={goToMyPets} />
    </NewPetLayout>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg },
  bigWrap: { marginBottom: spacing.md },
  tile: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  check: {
    position: 'absolute', right: -4, bottom: -4, width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  kicker: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2, color: colors.textMuted, marginTop: 10 },
  title: { fontFamily: fonts.extrabold, fontSize: 24, lineHeight: 30, color: colors.text, textAlign: 'center', marginTop: 6 },
  subtitle: {
    fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.textMuted,
    textAlign: 'center', marginTop: 10, maxWidth: 300,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, padding: 12, marginBottom: spacing.lg,
  },
  cardTexts: { flex: 1 },
  cardKicker: { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.8, color: colors.textMuted },
  cardName: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.text, marginTop: 2 },
  cardSummary: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badge: { backgroundColor: colors.primaryLight, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.primary },
});

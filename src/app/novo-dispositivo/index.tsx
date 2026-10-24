import { DeviceFlowLayout, DeviceStepHeader } from '@/components/devices/DeviceFlowLayout';
import { PetSelector } from '@/components/pets/PetSelector';
import { Button } from '@/components/ui/Button';
import { themed } from '@/constants/darkTheme';
import { DEVICE_TYPES, DeviceType } from '@/constants/deviceTypes';
import { usePets } from '@/hooks/usePets';
import { newPetDraft } from '@/services/newPetDraft';
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

  const { pets, loading } = usePets();
  const [petId, setPetId] = useState<string | undefined>(newDeviceDraft.get().petId);
  const selectedPetId = petId ?? (pets.length === 1 ? pets[0].id : undefined);
  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const noPets = !loading && pets.length === 0;

  const next = () => {
    if (!type || !selectedPetId) return;
    newDeviceDraft.set({ type, petId: selectedPetId });
    router.push('/novo-dispositivo/preparar');
  };

  const addPet = () => {
    newPetDraft.reset();
    router.push('/novo-pet');
  };

  if (noPets) {
    return (
      <DeviceFlowLayout step={1} onBack={() => router.back()}>
        <DeviceStepHeader
          kicker="Antes de começar"
          title="Cadastre um pet primeiro"
          subtitle="O dispositivo fica vinculado a um pet. Cadastre o seu para continuar."
        />
        <Button title="Cadastrar pet" onPress={addPet} />
      </DeviceFlowLayout>
    );
  }

  return (
    <DeviceFlowLayout step={1} onBack={() => router.back()}>
      <DeviceStepHeader
        kicker="Escolha o tipo"
        title="Qual dispositivo você quer conectar?"
        subtitle="Selecione uma opção para ver as instruções certas."
      />

      {pets.length > 1 ? (
        <View style={styles.petPicker}>
          <Text style={styles.petLabel}>Para qual pet?</Text>
          <PetSelector pets={pets} selectedId={selectedPetId ?? ''} onSelect={setPetId} />
        </View>
      ) : (
        !!selectedPet && <Text style={styles.petLabel}>Dispositivo para {selectedPet.name}</Text>
      )}

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

      <Button title="Continuar" onPress={next} disabled={!type || !selectedPetId} />
    </DeviceFlowLayout>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  petPicker: { marginBottom: spacing.md },
  petLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
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

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NewPetLayout, StepKicker, StepSubtitle, StepTitle } from '@/components/pets/NewPetLayout';
import { PhotoPicker } from '@/components/pets/PhotoPicker';
import { LabeledField } from '@/components/pets/LabeledField';
import { SelectField } from '@/components/pets/SelectField';
import { Button } from '@/components/ui/Button';
import { newPetDraft } from '@/services/newPetDraft';
import { Species } from '@/types/pet';
import { PetFormErrors, validatePetForm } from '@/utils/petValidation';

const SPECIES: readonly Species[] = ['Cachorro', 'Gato'];

export default function NewPetProfileScreen() {
  const router = useRouter();
  const draft = newPetDraft.get();

  const [form, setForm] = useState({
    name: draft.name, species: draft.species, breed: draft.breed,
    age: draft.age, weight: draft.weight, notes: draft.notes,
  });
  const [photoUri, setPhotoUri] = useState(draft.photoUri);
  const [errors, setErrors] = useState<PetFormErrors>({});

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleContinue = () => {
    const found = validatePetForm(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    newPetDraft.set({ ...form, photoUri });
    router.push('/novo-pet/dispositivo');
  };

  return (
    <NewPetLayout step={1} onBack={() => router.back()}>
      <StepKicker>PERFIL DO PET</StepKicker>
      <StepTitle>Quem vamos acompanhar?</StepTitle>
      <StepSubtitle>Adicione as informações básicas do seu melhor amigo.</StepSubtitle>

      <PhotoPicker uri={photoUri} onChange={setPhotoUri} />

      <View style={styles.row}>
        <LabeledField label="Nome" placeholder="Ex.: Nina" value={form.name}
          onChangeText={(t) => setField('name', t)} error={errors.name} />
      </View>

      <View style={styles.row}>
        <SelectField label="Espécie" value={form.species} options={SPECIES}
          onChange={(v) => setField('species', v)} />
        <LabeledField label="Raça" placeholder="Ex.: Vira-lata" value={form.breed}
          onChangeText={(t) => setField('breed', t)} error={errors.breed} />
      </View>

      <View style={styles.row}>
        <LabeledField label="Idade" suffix="anos" keyboardType="number-pad" value={form.age}
          onChangeText={(t) => setField('age', t.replace(/[^0-9]/g, ''))} error={errors.age} />
        <LabeledField label="Peso" suffix="kg" keyboardType="decimal-pad" value={form.weight}
          onChangeText={(t) => setField('weight', t.replace(/[^0-9,.]/g, ''))} error={errors.weight} />
      </View>

      <View style={styles.row}>
        <LabeledField label="Observações" placeholder="Ex.: Muito brincalhona e curiosa."
          multiline numberOfLines={3} value={form.notes}
          onChangeText={(t) => setField('notes', t)}
          style={{ minHeight: 70, textAlignVertical: 'top' }} />
      </View>

      <Button title="Continuar  ›" onPress={handleContinue} />
    </NewPetLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
});

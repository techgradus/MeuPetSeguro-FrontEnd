import { InfoCard } from '@/components/pets/InfoCard';
import { LabeledField } from '@/components/pets/LabeledField';
import { PetAvatar } from '@/components/pets/PetAvatar';
import { PetSelector } from '@/components/pets/PetSelector';
import { SelectField } from '@/components/pets/SelectField';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { Button } from '@/components/ui/Button';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { themed } from '@/constants/darkTheme';
import { colors, fonts, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { newPetDraft } from '@/services/newPetDraft';
import { petService } from '@/services/petService';
import { vaccineService } from '@/services/vaccineService';
import { Pet, PetFormValues, Species } from '@/types/pet';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SPECIES: readonly Species[] = ['Cachorro', 'Gato'];

type FormErrors = Partial<Record<keyof PetFormValues, string>>;

const toNumber = (v: string) => Number(v.replace(',', '.'));

function validate(v: PetFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!v.name.trim()) errors.name = 'Informe o nome do pet.';
  if (!v.breed.trim()) errors.breed = 'Informe a raça.';
  if (v.age === '' || isNaN(toNumber(v.age)) || toNumber(v.age) < 0) errors.age = 'Idade inválida.';
  if (v.weight === '' || isNaN(toNumber(v.weight)) || toNumber(v.weight) <= 0) errors.weight = 'Peso inválido.';
  return errors;
}

const toForm = (p: Pet): PetFormValues => ({
  name: p.name, species: p.species, breed: p.breed, age: p.age, weight: p.weight,
});

export default function MeusPetsScreen() {
  const router = useRouter();
  const { ms } = useResponsive();
  const goToTab = useTabNavigation();
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<PetFormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, refreshVaccines] = useState(0);

  // atualiza o resumo da carteira ao voltar para esta tela
  useFocusEffect(
    useCallback(() => {
      refreshVaccines((n) => n + 1);
    }, []),
  );

  useEffect(() => {
    petService.list().then((list) => {
      setPets(list);
      if (list[0]) { setSelectedId(list[0].id); setForm(toForm(list[0])); }
    });
  }, []);

  const selected = pets.find((p) => p.id === selectedId);

  const selectPet = (id: string) => {
    const pet = pets.find((p) => p.id === id);
    if (!pet) return;
    setSelectedId(id); setForm(toForm(pet)); setErrors({}); setSaved(false);
  };

  const setField = <K extends keyof PetFormValues>(key: K, value: PetFormValues[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form || !selected) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      setSaving(true);
      await petService.update(selected.id, form);
      setPets((list) => list.map((p) => (p.id === selected.id ? { ...p, ...form } : p)));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const comingSoon = (title: string) => () =>
    Alert.alert(title, 'Esta função será integrada nas próximas etapas.');

  const addNewPet = () => {
    newPetDraft.reset();
    router.push('/novo-pet');
  };

  const addDevice = () => {
    newDeviceDraft.reset();
    newDeviceDraft.set({ origin: 'meus-pets' });
    router.push('/novo-dispositivo');
  };

  if (!selected || !form) return <ScreenContainer edges={['top', 'left', 'right']}><View /></ScreenContainer>;

  const { upToDate, pending } = vaccineService.summary(selected.id, selected.vaccines);

  return (
    <ScreenContainer
      edges={['top', 'left', 'right']}
      footer={<BottomTabBar active="meus-pets" onPress={goToTab} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>Perfis</Text>
          <Text style={[styles.title, { fontSize: ms(26) }]}>Meus pets</Text>
        </View>
        <TouchableOpacity onPress={addNewPet} hitSlop={8}>
          <Text style={styles.link}>+ Adicionar novo pet</Text>
        </TouchableOpacity>
      </View>

      <PetSelector pets={pets} selectedId={selectedId} onSelect={selectPet} />

      <View style={styles.selectedRow}>
        <Text style={styles.sectionLabel}>Perfil selecionado</Text>
        <Text style={styles.selectedName}>{selected.name}</Text>
      </View>

      <View style={styles.avatarBox}>
        <PetAvatar source={selected.photo} onPress={comingSoon('Trocar foto')} />
      </View>

      {saved && <FeedbackBanner message={`Dados de ${form.name.trim()} salvos com sucesso.`} />}

      <View style={styles.row}>
        <LabeledField label="Nome" value={form.name} onChangeText={(t) => setField('name', t)} error={errors.name} />
      </View>

      <View style={styles.row}>
        <SelectField label="Espécie" value={form.species} options={SPECIES} onChange={(v) => setField('species', v)} />
        <LabeledField label="Raça" value={form.breed} onChangeText={(t) => setField('breed', t)} error={errors.breed} />
      </View>

      <View style={styles.row}>
        <LabeledField
          label="Idade" suffix="Anos" keyboardType="number-pad"
          value={form.age} onChangeText={(t) => setField('age', t.replace(/[^0-9]/g, ''))} error={errors.age}
        />
        <LabeledField
          label="Peso" suffix="Kg" keyboardType="decimal-pad"
          value={form.weight} onChangeText={(t) => setField('weight', t.replace(/[^0-9,.]/g, ''))} error={errors.weight}
        />
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 6, marginBottom: 10 }]}>Saúde e Cuidados</Text>

      <InfoCard
        icon="medkit-outline"
        title="Carteira de Vacinação"
        subtitle={`${upToDate} ${upToDate === 1 ? 'vacina em dia' : 'vacinas em dia'}, ${pending} ${pending === 1 ? 'pendente' : 'pendentes'}`}
        onPress={() => router.push({ pathname: '/carteira-vacinacao', params: { petId: selected.id } })}
      />

      <InfoCard
        icon="wifi"
        caption={`Dispositivo ${selected.species === 'Gato' ? 'da' : 'do'} ${selected.name}`}
        title={selected.device?.name ?? 'Nenhum dispositivo'}
        badge={selected.device?.linked ? 'Vinculado' : 'Não vinculado'}
        badgeOk={!!selected.device?.linked}
        onPress={addDevice}
      />

      <View style={styles.saveBox}>
        <Button title="Salvar alterações" onPress={handleSave} loading={saving} />
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.md },
  kicker: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted },
  title: { fontFamily: fonts.extrabold, color: colors.text },
  link: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary, marginBottom: 4 },
  selectedRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg,
  },
  sectionLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textMuted },
  selectedName: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  avatarBox: { alignItems: 'center', marginVertical: spacing.md },
  row: { flexDirection: 'row', gap: 12 },
  saveBox: { marginTop: spacing.sm, marginBottom: spacing.md },
}, dark));

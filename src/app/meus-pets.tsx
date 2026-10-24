import { PetDeviceList } from '@/components/devices/PetDeviceList';
import { EmptyPetsNotice } from '@/components/pets/EmptyPetsNotice';
import { InfoCard } from '@/components/pets/InfoCard';
import { LabeledField } from '@/components/pets/LabeledField';
import { PetAvatar } from '@/components/pets/PetAvatar';
import { PetSelector } from '@/components/pets/PetSelector';
import { SelectField } from '@/components/pets/SelectField';
import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { Button } from '@/components/ui/Button';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { getDeviceType } from '@/constants/deviceTypes';
import { themed } from '@/constants/darkTheme';
import { colors, fonts, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePets } from '@/hooks/usePets';
import { useVaccineSummary } from '@/hooks/useVaccineSummary';
import { useResponsive } from '@/hooks/useResponsive';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { deviceService } from '@/services/deviceService';
import { errorMessage } from '@/services/api';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { newPetDraft } from '@/services/newPetDraft';
import { petService } from '@/services/petService';
import type { PetDevice } from '@/types/device';
import { PetFormValues, Species } from '@/types/pet';
import { confirmAction, notify } from '@/utils/dialogs';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SPECIES: readonly Species[] = ['Cachorro', 'Gato'];

type FormValues = PetFormValues & { notes: string };
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

const toForm = (
  p: { name: string; species: Species; breed: string; age: string; weight: string; notes?: string },
): FormValues => ({
  name: p.name, species: p.species, breed: p.breed, age: p.age, weight: p.weight, notes: p.notes ?? '',
});

export default function MeusPetsScreen() {
  const router = useRouter();
  const { ms } = useResponsive();
  const goToTab = useTabNavigation();
  const { pets, loading, error, reload } = usePets();
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<FormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const idsKey = pets.map((p) => p.id).join(',');
  useEffect(() => {
    const current = pets.find((p) => p.id === selectedId) ?? pets[0];
    if (!current) {
      setSelectedId('');
      setForm(null);
      return;
    }
    setSelectedId(current.id);
    setForm(toForm(current));
    setErrors({});
    setSaved(false);
    setSaveError(null);
  }, [idsKey]);

  const selected = pets.find((p) => p.id === selectedId);
  const vaccineSummary = useVaccineSummary(selectedId || undefined);

  const selectPet = (id: string) => {
    const pet = pets.find((p) => p.id === id);
    if (!pet) return;
    setSelectedId(id); setForm(toForm(pet)); setErrors({}); setSaved(false); setSaveError(null);
  };

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSaved(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!form || !selected) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      setSaving(true);
      setSaveError(null);
      await petService.update(selected, form);
      await reload();
      setSaved(true);
    } catch (e) {
      setSaveError(errorMessage(e, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  const changePhoto = async () => {
    if (!selected) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    try {
      await petService.updatePhoto(selected.id, result.assets[0].uri);
      await reload();
    } catch (e) {
      notify('Não foi possível trocar a foto', errorMessage(e, 'Tente novamente em instantes.'));
    }
  };

  const removeDevice = (device: PetDevice) => {
    if (!selected) return;
    const label = getDeviceType(device.type).label;
    confirmAction({
      title: 'Remover dispositivo',
      message: `Desvincular ${label} (${device.code}) de ${selected.name}?`,
      confirmLabel: 'Remover',
      onConfirm: async () => {
        try {
          await deviceService.remove(selected.id, device.id);
          await reload();
        } catch (e) {
          notify('Não foi possível remover', errorMessage(e, 'Tente novamente em instantes.'));
        }
      },
    });
  };

  const addNewPet = () => {
    newPetDraft.reset();
    router.push('/novo-pet');
  };

  const addDevice = () => {
    newDeviceDraft.reset();
    newDeviceDraft.set({ origin: 'meus-pets', petId: selected?.id });
    router.push('/novo-dispositivo');
  };

  // Carregando, erro ou nenhum pet ainda
  if (!selected || !form) {
    return (
      <ScreenContainer
        edges={['top', 'left', 'right']}
        footer={<BottomTabBar active="meus-pets" onPress={goToTab} />}
      >
        <EmptyPetsNotice
          loading={loading || pets.length > 0}
          error={pets.length === 0 ? error : null}
          onAdd={addNewPet}
          onRetry={reload}
        />
      </ScreenContainer>
    );
  }

  const { upToDate, pending } = vaccineSummary ?? selected.vaccines;
  const devices = selected.devices;
  const deviceTitle =
    devices.length === 0
      ? 'Nenhum dispositivo'
      : devices.length === 1
        ? getDeviceType(devices[0].type).label
        : `${devices.length} dispositivos`;
  const deviceBadge = devices.length === 0 ? 'Não vinculado' : devices.some((d) => d.online) ? 'Online' : 'Offline';
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
        <PetAvatar source={selected.photo} onPress={changePhoto} />
      </View>

      {saved && <FeedbackBanner message={`Dados de ${form.name.trim()} salvos com sucesso.`} />}
      {!!saveError && <FeedbackBanner type="error" message={saveError} />}

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

      <View style={styles.row}>
        <LabeledField
          label="Observações" placeholder="Ex.: Muito brincalhona e curiosa."
          multiline numberOfLines={3} value={form.notes}
          onChangeText={(t) => setField('notes', t)}
          style={{ minHeight: 70, textAlignVertical: 'top' }}
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
        caption={`Dispositivos ${selected.species === 'Gato' ? 'da' : 'do'} ${selected.name}`}
        title={deviceTitle}
        subtitle={devices.length > 0 ? 'Toque para adicionar outro' : 'Toque para conectar o primeiro'}
        badge={deviceBadge}
        badgeOk={devices.some((d) => d.online)}
        onPress={addDevice}
      />

      <PetDeviceList devices={devices} onRemove={removeDevice} />

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

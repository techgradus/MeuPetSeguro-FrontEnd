import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import PhoneFrame from '@/components/PhoneFrame';
import { makeFieldStyles, LabeledField } from '@/components/pets/LabeledField';
import { SelectField } from '@/components/pets/SelectField';
import { useAppTheme } from '@/hooks/useAppTheme';
import { themed, textColor, surfaceColor } from '@/constants/darkTheme';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';
import { petService } from '@/services/petService';
import { vaccineService } from '@/services/vaccineService';
import { VaccineStatus } from '@/types/vaccine';
import { brToIso, isoToBr, maskDate, todayBr } from '@/utils/dateFormat';

const STATUS_OPTIONS: readonly VaccineStatus[] = ['Em dia', 'Próxima do vencimento', 'Atrasada'];

type Errors = Partial<Record<'name' | 'appliedAt' | 'nextDoseAt', string>>;

/** Campo de data com máscara dd/mm/aaaa e ícone de calendário. */
function DateField({
  label, value, onChange, error, placeholder, flex,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  error?: string;
  placeholder: string;
  flex?: boolean;
}) {
  const { dark, c } = useAppTheme();
  const dateStyles = useMemo(() => makeDateStyles(dark), [dark]);
  const fieldStyles = useMemo(() => makeFieldStyles(dark), [dark]);
  return (
    <View style={[dateStyles.wrapper, flex && { flex: 1 }]}>
      <Text style={dateStyles.label}>{label}</Text>
      <View style={[fieldStyles.box, !!error && dateStyles.boxError]}>
        <TextInput
          value={value}
          onChangeText={(t) => onChange(maskDate(t))}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          keyboardType="number-pad"
          maxLength={10}
          style={[
            dateStyles.input,
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />
        <Ionicons name="calendar-outline" size={18} color={c.muted} />
      </View>
      {!!error && <Text style={dateStyles.error}>{error}</Text>}
    </View>
  );
}

export default function AddVaccineScreen() {
  const router = useRouter();
  const { petId, vaccineId } = useLocalSearchParams<{ petId?: string; vaccineId?: string }>();
  const isEdit = !!vaccineId;

  const [petName, setPetName] = useState('');
  const [resolvedPetId, setResolvedPetId] = useState<string | undefined>(petId);

  const [name, setName] = useState('');
  const [appliedAt, setAppliedAt] = useState(todayBr());
  const [nextDoseAt, setNextDoseAt] = useState('');
  const [status, setStatus] = useState<VaccineStatus>('Em dia');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const layout = useLayout();
  const { dark, c } = useAppTheme();
  const { s } = layout;

  const styles = useMemo(
    () => makeStyles(layout, dark),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.frameWidth, layout.frameHeight, layout.insetTop, layout.insetBottom, layout.isWeb, dark],
  );

  useEffect(() => {
    (async () => {
      const pets = await petService.list();
      let targetPetId = petId;

      // modo edição: carrega os dados da vacina
      if (vaccineId) {
        const vaccine = await vaccineService.get(vaccineId);
        if (vaccine) {
          setName(vaccine.name);
          setAppliedAt(isoToBr(vaccine.appliedAt));
          setNextDoseAt(vaccine.nextDoseAt ? isoToBr(vaccine.nextDoseAt) : '');
          setStatus(vaccine.status);
          setNotes(vaccine.notes ?? '');
          targetPetId = vaccine.petId;
        }
      }

      const current = pets.find((p) => p.id === targetPetId) ?? pets[0];
      if (current) {
        setPetName(current.name);
        setResolvedPetId(current.id);
      }
    })();
  }, [petId, vaccineId]);

  function clearError(key: keyof Errors) {
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/meus-pets');
  }

  function validate() {
    const found: Errors = {};
    if (!name.trim()) found.name = 'Informe o nome da vacina.';

    const appliedIso = brToIso(appliedAt);
    if (!appliedIso) found.appliedAt = 'Data inválida.';

    if (nextDoseAt) {
      const nextIso = brToIso(nextDoseAt);
      if (!nextIso) found.nextDoseAt = 'Data inválida.';
      else if (appliedIso && nextIso < appliedIso) found.nextDoseAt = 'Deve ser após a aplicação.';
    }
    return { found, appliedIso };
  }

  async function save() {
    if (!resolvedPetId || saving) return;
    const { found, appliedIso } = validate();
    setErrors(found);
    if (Object.keys(found).length || !appliedIso) return;

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        appliedAt: appliedIso,
        nextDoseAt: nextDoseAt ? brToIso(nextDoseAt) ?? undefined : undefined,
        status,
        notes: notes.trim() || undefined,
      };
      if (vaccineId) await vaccineService.update(vaccineId, payload);
      else await vaccineService.add(resolvedPetId, payload);
      goBack(); // as telas anteriores recarregam ao voltar ao foco
    } finally {
      setSaving(false);
    }
  }

  const who = petName || 'seu pet';

  return (
    <PhoneFrame active="pet">
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            {/* CABEÇALHO */}
            <View style={styles.header}>
              <Pressable style={styles.backButton} onPress={goBack} accessibilityRole="button" accessibilityLabel="Voltar">
                <Ionicons name="chevron-back" size={s(22)} color={c.text} />
              </Pressable>
              <Text style={styles.headerTitle}>{isEdit ? 'Editar vacina' : 'Adicionar vacina'}</Text>
              <View style={styles.backButtonSpacer} />
            </View>

            <Text style={styles.kicker}>Carteira de {who}</Text>
            <Text style={styles.title}>{isEdit ? 'Edite os dados da dose' : 'Registre uma nova dose'}</Text>
            <Text style={styles.note}>Este registro será salvo somente na carteira de {who}.</Text>

            {/* CAMPOS */}
            <View style={styles.row}>
              <LabeledField
                label="Nome da vacina"
                placeholder="Ex: V10"
                value={name}
                onChangeText={(t) => { setName(t); clearError('name'); }}
                error={errors.name}
              />
            </View>

            <View style={styles.row}>
              <DateField
                flex
                label="Data de aplicação"
                placeholder="dd/mm/aaaa"
                value={appliedAt}
                onChange={(t) => { setAppliedAt(t); clearError('appliedAt'); }}
                error={errors.appliedAt}
              />
              <DateField
                flex
                label="Próxima dose (opcional)"
                placeholder="dd/mm/aaaa"
                value={nextDoseAt}
                onChange={(t) => { setNextDoseAt(t); clearError('nextDoseAt'); }}
                error={errors.nextDoseAt}
              />
            </View>

            <View style={styles.row}>
              <SelectField label="Status" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
            </View>

            <View style={styles.row}>
              <LabeledField
                label="Observações"
                placeholder="Veterinário, clínica, lote..."
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            {/* AÇÃO */}
            <Pressable
              style={[styles.saveButton, saving && styles.saveDisabled]}
              onPress={save}
              disabled={saving}
              accessibilityRole="button"
            >
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>{isEdit ? 'Salvar alterações' : 'Salvar'}</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PhoneFrame>
  );
}

const makeDateStyles = (dark: boolean) => StyleSheet.create(themed({
  wrapper: { marginBottom: 14 },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, marginBottom: 6 },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.medium, fontSize: 14, color: colors.text, paddingVertical: 10 },
  boxError: { borderColor: colors.error, backgroundColor: colors.errorLight },
  error: { fontFamily: fonts.medium, fontSize: 11, color: colors.error, marginTop: 5 },
}, dark));

function makeStyles({ s, isWeb, insetTop, navHeight }: Layout, dark: boolean) {
  const border = '#D2E8E3';

  return StyleSheet.create(themed({
    flex: { flex: 1 },
    scrollContent: {
      paddingHorizontal: s(24),
      paddingTop: isWeb ? s(24) : insetTop + s(14),
      paddingBottom: navHeight + s(24),
    },
    content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: s(18) },
    backButton: {
      width: s(44), height: s(44), borderRadius: s(12), backgroundColor: ui.card, borderWidth: 1,
      borderColor: border, alignItems: 'center', justifyContent: 'center',
    },
    backButtonSpacer: { width: s(44), height: s(44) },
    headerTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.extrabold, fontSize: s(20), color: ui.strong },

    kicker: { fontFamily: fonts.medium, fontSize: s(13), color: '#6F8481' },
    title: { fontFamily: fonts.extrabold, fontSize: s(20), color: ui.strong, marginTop: s(4) },
    note: { fontFamily: fonts.medium, fontSize: s(10), color: '#6F8481', marginTop: s(6), marginBottom: s(18) },

    row: { flexDirection: 'row', gap: 12 },

    saveButton: {
      marginTop: s(6), height: s(52), borderRadius: s(14), backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    saveDisabled: { opacity: 0.6 },
    saveText: { fontFamily: fonts.extrabold, fontSize: s(14), color: '#FFFFFF' },
  }, dark));
}

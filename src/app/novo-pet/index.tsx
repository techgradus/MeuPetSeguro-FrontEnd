import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { themed } from '@/constants/darkTheme';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';
import { petService } from '@/services/petService';
import type { Species as PetSpecies } from '@/types/pet';

/* ============================================================
   FLUXO "NOVO PET" (4 etapas)
   1. Perfil do pet  2. Casa conectada  3. Vínculo  4. Cadastrado
============================================================ */

const TOTAL_STEPS = 4;
const SPECIES = ['Cachorro', 'Gato', 'Outro'] as const;

type Species = (typeof SPECIES)[number];

type Form = {
  name: string;
  species: Species;
  breed: string;
  age: string;
  weight: string;
  notes: string;
};

const emptyForm: Form = {
  name: '',
  species: 'Cachorro',
  breed: '',
  age: '',
  weight: '',
  notes: '',
};

export default function NewPetScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(emptyForm);
  const [focused, setFocused] = useState<keyof Form | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const layout = useLayout();
  const { tx } = useAppTheme();
  const { s } = layout;

  const styles = useMemo(
    () => makeStyles(layout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      layout.frameWidth,
      layout.frameHeight,
      layout.insetTop,
      layout.insetBottom,
      layout.isWeb,
      layout.dark,
    ],
  );

  const petName = form.name.trim() || 'seu pet';
  const canContinue = form.name.trim().length > 0;

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function goBack() {
    if (saving) return;

    if (step > 1 && step < TOTAL_STEPS) {
      setError(null);
      setStep(step - 1);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/meus-pets');
    }
  }

  async function register() {
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      await petService.add({
        name: form.name,
        species: form.species as PetSpecies,
        breed: form.breed,
        age: form.age,
        weight: form.weight,
        notes: form.notes,
        photoUri,
      });
      setStep(4);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'Não foi possível cadastrar o pet. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  function finish() {
    router.replace('/meus-pets');
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à câmera nas configurações do aparelho.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  function choosePhoto() {
    if (Platform.OS === 'web') {
      pickFromLibrary();
      return;
    }

    Alert.alert('Adicionar foto', undefined, [
      { text: 'Câmera', onPress: pickFromCamera },
      { text: 'Galeria', onPress: pickFromLibrary },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  const summary = [
    form.breed.trim() || form.species,
    form.age.trim() ? `${form.age.trim()} anos` : '',
    form.weight.trim() ? `${form.weight.trim()} kg` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  function input(
    key: Exclude<keyof Form, 'species'>,
    label: string,
    options: {
      placeholder?: string;
      keyboardType?: 'default' | 'numeric' | 'decimal-pad';
      suffix?: string;
      multiline?: boolean;
    } = {},
  ) {
    const isFocused = focused === key;

    return (
      <View style={options.suffix ? styles.halfField : undefined}>
        <Text style={styles.fieldLabel}>{label}</Text>

        <View
          style={[
            styles.inputBox,
            options.multiline && styles.inputBoxMultiline,
            isFocused && styles.inputBoxFocused,
          ]}
        >
          <TextInput
            value={form[key]}
            onChangeText={(text) => update(key, text)}
            onFocus={() => setFocused(key)}
            onBlur={() => setFocused(null)}
            placeholder={options.placeholder}
            placeholderTextColor="#9AABA9"
            keyboardType={options.keyboardType ?? 'default'}
            multiline={options.multiline}
            textAlignVertical={options.multiline ? 'top' : 'center'}
            accessibilityLabel={label}
            style={[
              styles.input,
              Platform.OS === 'web'
                ? ({ outlineStyle: 'none' } as object)
                : null,
            ]}
          />

          {options.suffix && (
            <Text style={styles.suffix}>{options.suffix}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <PhoneFrame active="pet">
      {/* Esconde o cabeçalho nativo; a tela tem o próprio */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            {/* CABEÇALHO */}
            <View style={styles.header}>
              <Pressable
                style={styles.backButton}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <Ionicons
                  name="chevron-back"
                  size={s(22)}
                  color={tx(colors.text)}
                />
              </Pressable>

              <Text style={styles.headerTitle}>Novo pet</Text>

              <View style={styles.backButtonSpacer} />
            </View>

            {/* PROGRESSO */}
            <View style={styles.progressRow}>
              <View style={styles.segments}>
                {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.segment,
                      index < step && styles.segmentDone,
                    ]}
                  />
                ))}
              </View>

              <Text style={styles.stepLabel}>
                ETAPA {step} DE {TOTAL_STEPS}
              </Text>
            </View>

            {/* ETAPA 1: PERFIL */}
            {step === 1 && (
              <>
                <Text style={styles.eyebrow}>Perfil do pet</Text>
                <Text style={styles.title}>Quem vamos acompanhar?</Text>
                <Text style={styles.subtitle}>
                  Adicione as informações básicas do seu melhor amigo.
                </Text>

                <Pressable
                  style={styles.photoBox}
                  accessibilityRole="button"
                  accessibilityLabel="Adicionar foto"
                  onPress={choosePhoto}
                >
                  {photoUri ? (
                    <Image
                      source={{ uri: photoUri }}
                      style={styles.photoImage}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={s(26)}
                        color={colors.primary}
                      />
                      <Text style={styles.photoTitle}>Adicionar foto</Text>
                      <Text style={styles.photoHint}>Câmera ou galeria</Text>
                    </>
                  )}
                </Pressable>

                {input('name', 'Nome', { placeholder: 'Ex.: Nina' })}

                <Text style={[styles.fieldLabel, styles.fieldGap]}>Espécie</Text>
                <View style={styles.chipsRow}>
                  {SPECIES.map((option) => {
                    const selected = form.species === option;

                    return (
                      <Pressable
                        key={option}
                        style={[styles.chip, selected && styles.chipSelected]}
                        onPress={() => update('species', option)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected && styles.chipTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.fieldGap}>
                  {input('breed', 'Raça', { placeholder: 'Ex.: Vira-lata' })}
                </View>

                <View style={[styles.twoColumns, styles.fieldGap]}>
                  {input('age', 'Idade', {
                    placeholder: '0',
                    keyboardType: 'numeric',
                    suffix: 'Anos',
                  })}
                  {input('weight', 'Peso', {
                    placeholder: '0,0',
                    keyboardType: 'decimal-pad',
                    suffix: 'Kg',
                  })}
                </View>

                <View style={styles.fieldGap}>
                  {input('notes', 'Observações', {
                    placeholder: 'Ex.: Muito brincalhona e curiosa.',
                    multiline: true,
                  })}
                </View>

                <Pressable
                  style={[styles.primary, !canContinue && styles.disabled]}
                  onPress={() => setStep(2)}
                  disabled={!canContinue}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canContinue }}
                >
                  <Text style={styles.primaryText}>Continuar</Text>
                </Pressable>

                {!canContinue && (
                  <Text style={styles.hint}>
                    Informe o nome do pet para continuar.
                  </Text>
                )}
              </>
            )}

            {/* ETAPA 2: CASA CONECTADA */}
            {step === 2 && (
              <>
                <Text style={styles.eyebrow}>Casa conectada</Text>
                <Text style={styles.title}>
                  Conecte o dispositivo{' '}
                  {form.name.trim() ? `da ${form.name.trim()}` : 'do seu pet'}
                </Text>
                <Text style={styles.subtitle}>
                  O dispositivo transforma os cuidados diários em informações
                  que você acompanha à distância.
                </Text>

                <View style={styles.infoCard}>
                  <View style={styles.deviceArt}>
                    <Ionicons
                      name="radio-button-on-outline"
                      size={s(40)}
                      color={colors.primary}
                    />
                  </View>

                  <Text style={styles.infoTitle}>Próximo passo</Text>
                  <Text style={styles.infoText}>
                    Ligue o colar ou pote inteligente e tenha a senha do Wi-Fi
                    da casa em mãos.
                  </Text>
                </View>

                <Pressable
                  style={[styles.primary, saving && styles.disabled]}
                  onPress={() => {
                    setError(null);
                    setStep(3);
                  }}
                  disabled={saving}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryText}>Conectar agora</Text>
                </Pressable>

                <Pressable
                  style={[styles.secondary, saving && styles.disabled]}
                  onPress={register}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityState={{ busy: saving }}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.secondaryText}>Vincular depois</Text>
                  )}
                </Pressable>

                {error && <Text style={styles.error}>{error}</Text>}
              </>
            )}

            {/* ETAPA 3: VÍNCULO */}
            {step === 3 && (
              <>
                <Text style={styles.eyebrow}>Vínculo do dispositivo</Text>
                <Text style={styles.title}>Tudo pronto para conectar</Text>
                <Text style={styles.subtitle}>
                  Você seguirá pelo assistente de conexão e voltará aqui quando
                  terminar.
                </Text>

                <View style={styles.tipCard}>
                  <Text style={styles.tipTitle}>Conexão por Wi-Fi</Text>
                  <Text style={styles.tipText}>
                    Use a rede da sua casa para acompanhar{' '}
                    {form.name.trim() ? `a ${form.name.trim()}` : 'seu pet'} de
                    qualquer lugar.
                  </Text>
                </View>

                <Pressable
                  style={[styles.primary, saving && styles.disabled]}
                  onPress={register}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityState={{ busy: saving }}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryText}>Abrir assistente</Text>
                  )}
                </Pressable>

                <Pressable
                  style={[styles.secondary, saving && styles.disabled]}
                  onPress={register}
                  disabled={saving}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryText}>Vincular depois</Text>
                </Pressable>

                {error && <Text style={styles.error}>{error}</Text>}
              </>
            )}

            {/* ETAPA 4: CADASTRADO */}
            {step === 4 && (
              <View style={styles.successWrap}>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="checkmark"
                    size={s(34)}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.eyebrowCenter}>Pet cadastrado</Text>
                <Text style={styles.titleCenter}>
                  {petName === 'seu pet' ? 'Seu pet' : petName} já faz parte da
                  família!
                </Text>
                <Text style={styles.subtitleCenter}>
                  O perfil está pronto e pode receber novos dispositivos quando
                  você quiser.
                </Text>

                <View style={styles.profileCard}>
                  <View style={styles.profileIcon}>
                    <Ionicons
                      name="paw-outline"
                      size={s(22)}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.profileLabel}>NOVO PERFIL</Text>
                    <Text style={styles.profileName}>
                      {form.name.trim() || 'Seu pet'}
                    </Text>
                    <Text style={styles.profileSummary}>{summary}</Text>
                  </View>

                  <View style={styles.readyBadge}>
                    <Text style={styles.readyText}>Pronto</Text>
                  </View>
                </View>

                <Pressable
                  style={[styles.primary, styles.fullWidth]}
                  onPress={finish}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryText}>Ver meus pets</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PhoneFrame>
  );
}

/* ============================================================
   ESTILOS (dependem do tamanho da tela)
============================================================ */

function makeStyles({ dark, s, isWeb, insetTop, navHeight }: Layout) {
  const border = '#BFEBD6';

  return StyleSheet.create(themed({
    flex: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: s(24),
      paddingTop: isWeb ? s(24) : insetTop + s(14),
      paddingBottom: navHeight + s(24),
    },

    content: {
      width: '100%',
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center',
    },

    /* CABEÇALHO */

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    backButton: {
      width: s(44),
      height: s(44),
      borderRadius: s(12),
      backgroundColor: ui.card,
      borderWidth: 1,
      borderColor: '#D2E8E3',
      alignItems: 'center',
      justifyContent: 'center',
    },

    backButtonSpacer: {
      width: s(44),
      height: s(44),
    },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: fonts.extrabold,
      fontSize: s(22),
      color: ui.strong,
    },

    /* PROGRESSO */

    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: s(18),
    },

    segments: {
      flex: 1,
      flexDirection: 'row',
      gap: s(8),
    },

    segment: {
      flex: 1,
      height: s(5),
      borderRadius: s(3),
      backgroundColor: '#D3DAD8',
    },

    segmentDone: {
      backgroundColor: colors.primary,
    },

    stepLabel: {
      fontFamily: fonts.bold,
      fontSize: s(10),
      color: '#7E8C8A',
      marginLeft: s(12),
    },

    /* TEXTOS */

    eyebrow: {
      fontFamily: fonts.bold,
      fontSize: s(13),
      color: '#6F8481',
      marginTop: s(22),
    },

    title: {
      fontFamily: fonts.extrabold,
      fontSize: s(22),
      color: ui.strong,
      marginTop: s(4),
    },

    subtitle: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      lineHeight: s(18),
      color: '#5C6F6D',
      marginTop: s(6),
    },

    eyebrowCenter: {
      fontFamily: fonts.bold,
      fontSize: s(13),
      color: '#6F8481',
      marginTop: s(16),
      textAlign: 'center',
    },

    titleCenter: {
      fontFamily: fonts.extrabold,
      fontSize: s(22),
      color: ui.strong,
      marginTop: s(4),
      textAlign: 'center',
    },

    subtitleCenter: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      lineHeight: s(18),
      color: '#5C6F6D',
      marginTop: s(8),
      textAlign: 'center',
      paddingHorizontal: s(16),
    },

    /* ETAPA 1 */

    photoBox: {
      alignSelf: 'center',
      width: s(140),
      height: s(140),
      borderRadius: s(24),
      backgroundColor: ui.tealSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: s(20),
      overflow: 'hidden',
    },

    photoImage: {
      width: '100%',
      height: '100%',
    },

    photoTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(12),
      color: colors.primary,
      marginTop: s(8),
    },

    photoHint: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: '#5C6F6D',
      marginTop: 2,
    },

    fieldLabel: {
      fontFamily: fonts.bold,
      fontSize: s(12),
      color: '#5C6F6D',
      marginBottom: s(6),
    },

    fieldGap: {
      marginTop: s(14),
    },

    inputBox: {
      minHeight: s(46),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: border,
      backgroundColor: ui.card,
      paddingHorizontal: s(14),
      flexDirection: 'row',
      alignItems: 'center',
    },

    inputBoxMultiline: {
      minHeight: s(96),
      alignItems: 'flex-start',
      paddingTop: s(10),
    },

    inputBoxFocused: {
      borderColor: colors.primary,
    },

    input: {
      flex: 1,
      fontFamily: fonts.bold,
      fontSize: s(14),
      color: colors.text,
      paddingVertical: s(8),
    },

    suffix: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#5C6F6D',
      marginLeft: s(8),
    },

    twoColumns: {
      flexDirection: 'row',
      gap: s(12),
    },

    halfField: {
      flex: 1,
    },

    chipsRow: {
      flexDirection: 'row',
      gap: s(8),
    },

    chip: {
      flex: 1,
      height: s(42),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: border,
      backgroundColor: ui.card,
      alignItems: 'center',
      justifyContent: 'center',
    },

    chipSelected: {
      backgroundColor: ui.tealSoft,
      borderColor: colors.primary,
    },

    chipText: {
      fontFamily: fonts.bold,
      fontSize: s(13),
      color: '#5C6F6D',
    },

    chipTextSelected: {
      fontFamily: fonts.extrabold,
      color: colors.primary,
    },

    /* BOTÕES */

    primary: {
      marginTop: s(22),
      height: s(52),
      borderRadius: s(14),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    fullWidth: {
      alignSelf: 'stretch',
    },

    disabled: {
      opacity: 0.45,
    },

    primaryText: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: '#FFFFFF',
    },

    secondary: {
      marginTop: s(12),
      height: s(52),
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: ui.card,
      alignItems: 'center',
      justifyContent: 'center',
    },

    secondaryText: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.primary,
    },

    hint: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: '#7E8C8A',
      textAlign: 'center',
      marginTop: s(8),
    },

    error: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      color: '#C0392B',
      textAlign: 'center',
      marginTop: s(10),
    },

    /* ETAPA 2 */

    infoCard: {
      marginTop: s(20),
      backgroundColor: ui.card,
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: border,
      paddingVertical: s(20),
      paddingHorizontal: s(18),
      alignItems: 'center',
    },

    deviceArt: {
      width: s(110),
      height: s(72),
      borderRadius: s(36),
      backgroundColor: '#B7E3DF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    infoTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.primary,
      marginTop: s(12),
    },

    infoText: {
      fontFamily: fonts.medium,
      fontSize: s(13),
      lineHeight: s(19),
      color: '#5C6F6D',
      textAlign: 'center',
      marginTop: s(4),
    },

    /* ETAPA 3 */

    tipCard: {
      marginTop: s(20),
      backgroundColor: '#C2E2E0',
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: border,
      padding: s(14),
    },

    tipTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(13),
      color: colors.primary,
    },

    tipText: {
      fontFamily: fonts.medium,
      fontSize: s(12),
      lineHeight: s(18),
      color: '#3F6B67',
      marginTop: s(4),
    },

    /* ETAPA 4 */

    successWrap: {
      alignItems: 'center',
      marginTop: s(24),
    },

    successIcon: {
      width: s(72),
      height: s(72),
      borderRadius: s(20),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    profileCard: {
      alignSelf: 'stretch',
      marginTop: s(22),
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: colors.primary,
      padding: s(14),
      flexDirection: 'row',
      alignItems: 'center',
    },

    profileIcon: {
      width: s(44),
      height: s(44),
      borderRadius: s(12),
      backgroundColor: ui.tealSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    profileInfo: {
      flex: 1,
      marginLeft: s(12),
    },

    profileLabel: {
      fontFamily: fonts.bold,
      fontSize: s(10),
      letterSpacing: 0.6,
      color: '#6F8481',
    },

    profileName: {
      fontFamily: fonts.extrabold,
      fontSize: s(18),
      color: colors.text,
    },

    profileSummary: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: 1,
    },

    readyBadge: {
      backgroundColor: ui.tealSoft,
      borderRadius: s(12),
      paddingHorizontal: s(12),
      paddingVertical: s(4),
    },

    readyText: {
      fontFamily: fonts.bold,
      fontSize: s(11),
      color: colors.primary,
    },
  }, dark));
}

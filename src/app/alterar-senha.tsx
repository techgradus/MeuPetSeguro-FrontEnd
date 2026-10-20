import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { themed } from '@/constants/darkTheme';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';
import { authService, INVALID_CURRENT_PASSWORD } from '@/services/authService';

/* ============================================================
   VALIDAÇÃO
============================================================ */

type FieldKey = 'current' | 'next' | 'confirm';

const MIN_LENGTH = 8;

function validate(values: Record<FieldKey, string>): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};

  if (!values.current) errors.current = 'Informe a senha atual.';

  if (values.next.length < MIN_LENGTH) {
    errors.next = `Use pelo menos ${MIN_LENGTH} caracteres.`;
  } else if (!/[A-Za-z]/.test(values.next) || !/\d/.test(values.next)) {
    errors.next = 'Inclua letras e números.';
  } else if (values.next === values.current) {
    errors.next = 'A nova senha deve ser diferente da atual.';
  }

  if (values.confirm !== values.next) errors.confirm = 'As senhas não conferem.';

  return errors;
}

const FIELDS: { key: FieldKey; label: string; placeholder: string }[] = [
  { key: 'current', label: 'Senha atual', placeholder: 'Digite sua senha atual' },
  { key: 'next', label: 'Nova senha', placeholder: 'Mínimo de 8 caracteres' },
  { key: 'confirm', label: 'Confirmar nova senha', placeholder: 'Repita a nova senha' },
];

/* ============================================================
   TELA
============================================================ */

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { tx } = useAppTheme();

  const [values, setValues] = useState<Record<FieldKey, string>>({ current: '', next: '', confirm: '' });
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [visible, setVisible] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [focused, setFocused] = useState<FieldKey | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const layout = useLayout();
  const { s } = layout;

  const styles = useMemo(
    () => makeStyles(layout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.frameWidth, layout.frameHeight, layout.insetTop, layout.insetBottom, layout.isWeb, layout.dark],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const errors = validate(values);
  const canSave = Object.keys(errors).length === 0 && !saving && !saved;

  function update(key: FieldKey, value: string) {
    setServerError(null);
    setValues((current) => ({ ...current, [key]: value }));
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/minha-conta');
    }
  }

  async function save() {
    if (!canSave) return;
    try {
      setSaving(true);
      setServerError(null);
      await authService.changePassword(values.current, values.next);
      setSaved(true);
      // volta para Minha Conta depois de mostrar a confirmação
      timer.current = setTimeout(goBack, 1500);
    } catch (e) {
      setServerError(
        e instanceof Error && e.message === INVALID_CURRENT_PASSWORD
          ? 'A senha atual está incorreta.'
          : 'Não foi possível alterar a senha. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PhoneFrame active="settings">
      {/* Esconde o cabeçalho nativo; a tela tem o próprio */}
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
              <Pressable
                style={styles.backButton}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <Ionicons name="chevron-back" size={s(22)} color={tx(colors.text)} />
              </Pressable>

              <Text style={styles.headerTitle}>Alterar senha</Text>

              <View style={styles.backButtonSpacer} />
            </View>

            <Text style={styles.intro}>
              Escolha uma senha forte, com letras e números, para proteger a sua conta.
            </Text>

            {/* CAMPOS */}
            <View style={styles.formCard}>
              {FIELDS.map((field, index) => {
                const isFocused = focused === field.key;
                const error = touched[field.key] ? errors[field.key] : undefined;
                const show = !!visible[field.key];

                return (
                  <View key={field.key} style={[styles.field, index > 0 && styles.fieldDivider]}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>

                    <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
                      <TextInput
                        value={values[field.key]}
                        onChangeText={(text) => update(field.key, text)}
                        onFocus={() => setFocused(field.key)}
                        onBlur={() => {
                          setFocused(null);
                          setTouched((t) => ({ ...t, [field.key]: true }));
                        }}
                        placeholder={field.placeholder}
                        placeholderTextColor="#9AABA9"
                        secureTextEntry={!show}
                        autoCapitalize="none"
                        autoCorrect={false}
                        accessibilityLabel={field.label}
                        style={[
                          styles.input,
                          // remove o contorno padrão do navegador
                          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
                        ]}
                      />

                      <Pressable
                        onPress={() => setVisible((v) => ({ ...v, [field.key]: !v[field.key] }))}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={show ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        <Ionicons
                          name={show ? 'eye-outline' : 'eye-off-outline'}
                          size={s(20)}
                          color={tx('#6F8481')}
                        />
                      </Pressable>
                    </View>

                    {!!error && <Text style={styles.fieldError}>{error}</Text>}
                  </View>
                );
              })}
            </View>

            {!!serverError && (
              <View style={styles.errorRow} accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle" size={s(16)} color={ui.signOut} />
                <Text style={styles.errorText}>{serverError}</Text>
              </View>
            )}

            {/* AÇÃO */}
            <Pressable
              style={[styles.saveButton, !canSave && styles.saveDisabled]}
              onPress={save}
              disabled={!canSave}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Salvar nova senha</Text>
              )}
            </Pressable>

            {saved && (
              <View style={styles.savedRow} accessibilityLiveRegion="polite">
                <Ionicons name="checkmark-circle" size={s(16)} color={colors.primary} />
                <Text style={styles.savedText}>Senha alterada com sucesso</Text>
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
  const border = '#D2E8E3';

  return StyleSheet.create(themed({
    flex: { flex: 1 },

    scrollContent: {
      paddingHorizontal: s(24),
      paddingTop: isWeb ? s(24) : insetTop + s(14),
      paddingBottom: navHeight + s(24),
    },

    content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },

    /* CABEÇALHO */

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

    backButton: {
      width: s(44),
      height: s(44),
      borderRadius: s(12),
      backgroundColor: ui.card,
      borderWidth: 1,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    backButtonSpacer: { width: s(44), height: s(44) },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: fonts.extrabold,
      fontSize: s(22),
      color: ui.strong,
    },

    intro: {
      fontFamily: fonts.medium,
      fontSize: s(13),
      lineHeight: s(19),
      color: '#6F8481',
      marginTop: s(20),
      marginBottom: s(4),
    },

    /* CAMPOS */

    formCard: {
      marginTop: s(14),
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      paddingHorizontal: s(14),
    },

    field: { paddingVertical: s(12) },

    fieldDivider: { borderTopWidth: 1, borderTopColor: '#E3ECEA' },

    fieldLabel: { fontFamily: fonts.bold, fontSize: s(10), color: '#6F8481' },

    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      borderBottomWidth: 1,
      borderBottomColor: 'transparent',
    },

    inputRowFocused: { borderBottomColor: colors.primary },

    input: {
      flex: 1,
      minWidth: 0,
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.text,
      paddingVertical: s(8),
    },

    fieldError: { fontFamily: fonts.medium, fontSize: s(11), color: ui.signOut, marginTop: s(2) },

    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      marginTop: s(14),
      padding: s(10),
      borderRadius: s(10),
      backgroundColor: ui.signOutSoft,
    },

    errorText: { flex: 1, fontFamily: fonts.medium, fontSize: s(12), color: colors.text },

    /* AÇÃO */

    saveButton: {
      marginTop: s(18),
      height: s(52),
      borderRadius: s(14),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    saveDisabled: { opacity: 0.45 },

    saveText: { fontFamily: fonts.extrabold, fontSize: s(13), color: '#FFFFFF' },

    savedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      marginTop: s(10),
    },

    savedText: { fontFamily: fonts.bold, fontSize: s(12), color: colors.primary }, 
  }, dark));
}

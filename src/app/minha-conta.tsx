import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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
import { useAuth } from '@/hooks/useAuth';
import { errorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';
import { useProfilePhoto, setProfilePhoto } from '@/hooks/useProfilePhoto';
import { notify } from '@/utils/dialogs';

type FieldKey = 'name' | 'email' | 'phone';

function getInitials(name?: string) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// Máscara simples: (11) 98765-4321
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/* TELA */

export default function AccountScreen() {
  const router = useRouter();

  const { user, updateProfile, signOut: logout } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: formatPhone(user?.phone ?? ''),
  });
  const [focused, setFocused] = useState<FieldKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const layout = useLayout();
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

  const emailValid = /^\S+@\S+\.\S+$/.test(form.email.trim());
  const nameValid = form.name.trim().length > 1;
  const phoneDigits = form.phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length === 0 || phoneDigits.length === 10 || phoneDigits.length === 11;
  const canSave = emailValid && nameValid && phoneValid;

  const { tx } = useAppTheme();
  const photo = useProfilePhoto();

  async function changePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify('Permissão necessária', 'Permita o acesso às fotos para escolher uma imagem.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setProfilePhoto(result.assets[0].uri);
  }

  function update(key: FieldKey, value: string) {
    setSaved(false);
    setSaveError(null);
    setForm((current) => ({ ...current, [key]: value }));
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/config');
    }
  }

  async function save() {
    if (!canSave || saving) return;
    try {
      setSaving(true);
      setSaveError(null);
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: phoneDigits, // '' apaga o telefone
      });
      setSaved(true);
    } catch (e) {
      setSaveError(errorMessage(e, 'Não foi possível salvar. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await logout();
    router.replace('/login');
  }

  const fields: {
    key: FieldKey;
    label: string;
    placeholder: string;
    keyboardType: 'default' | 'email-address' | 'phone-pad';
    autoCapitalize: 'words' | 'none';
    error?: string;
  }[] = [
    {
      key: 'name',
      label: 'Nome completo',
      placeholder: 'Seu nome',
      keyboardType: 'default',
      autoCapitalize: 'words',
      error: nameValid ? undefined : 'Informe seu nome.',
    },
    {
      key: 'email',
      label: 'E-mail',
      placeholder: 'voce@email.com',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      error: emailValid ? undefined : 'Digite um e-mail válido.',
    },
    {
      key: 'phone',
      label: 'Telefone',
      placeholder: '(00) 00000-0000',
      keyboardType: 'phone-pad',
      autoCapitalize: 'none',
      error: phoneValid ? undefined : 'Informe o DDD e o número.',
    },
  ];

  return (
    <PhoneFrame active="settings">
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

              <Text style={styles.headerTitle}>Minha Conta</Text>

              <View style={styles.backButtonSpacer} />
            </View>

            {/* PERFIL */}
            <View style={styles.profileCard}>
              <View>
                <View style={styles.avatar}>
                  {photo ? (
                    <Image
                      source={{ uri: photo }}
                      style={styles.avatarImage}
                      accessibilityLabel="Foto de perfil"
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {getInitials(form.name)}
                    </Text>
                  )}
                </View>

                <Pressable
                  style={styles.cameraBadge}
                  accessibilityRole="button"
                  accessibilityLabel="Trocar foto de perfil"
                  onPress={changePhoto}
                >
                  <Ionicons name="camera-outline" size={s(14)} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {form.name || 'Seu nome'}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {form.email}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={changePhoto}
                  hitSlop={8}
                >
                  <Text style={styles.changePhoto}>Trocar foto de perfil</Text>
                </Pressable>
              </View>
            </View>

            {/* DADOS PESSOAIS */}
            <Text style={styles.sectionLabel}>DADOS PESSOAIS</Text>

            <View style={styles.formCard}>
              {fields.map((field, index) => {
                const isFocused = focused === field.key;

                return (
                  <View
                    key={field.key}
                    style={[
                      styles.field,
                      index > 0 && styles.fieldDivider,
                    ]}
                  >
                    <Text style={styles.fieldLabel}>{field.label}</Text>

                    <TextInput
                      value={form[field.key]}
                      onChangeText={(text) =>
                        update(
                          field.key,
                          field.key === 'phone' ? formatPhone(text) : text,
                        )
                      }
                      onFocus={() => setFocused(field.key)}
                      onBlur={() => setFocused(null)}
                      placeholder={field.placeholder}
                      placeholderTextColor="#9AABA9"
                      keyboardType={field.keyboardType}
                      autoCapitalize={field.autoCapitalize}
                      autoCorrect={false}
                      accessibilityLabel={field.label}
                      style={[
                        styles.input,
                        isFocused && styles.inputFocused,
                        // remove o contorno padrão do navegador
                        Platform.OS === 'web'
                          ? ({ outlineStyle: 'none' } as object)
                          : null,
                      ]}
                    />

                    {field.error && (
                      <Text style={styles.fieldError}>{field.error}</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* SEGURANÇA */}
            <Text style={styles.sectionLabel}>SEGURANÇA</Text>

            <Pressable
              style={styles.passwordCard}
              accessibilityRole="button"
              accessibilityLabel="Alterar senha. Atualize sua senha de acesso"
              // TODO: abrir a tela de alterar senha
              onPress={() => router.push('/alterar-senha')}
            >
              <View style={styles.passwordIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={s(22)}
                  color={colors.primary}
                />
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.passwordTitle}>Alterar senha</Text>
                <Text style={styles.passwordSubtitle}>
                  Atualize sua senha de acesso
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={s(18)}
                color={tx(colors.text)}
              />
            </Pressable>

            {/* AÇÕES */}
            <Pressable
              style={[styles.saveButton, (!canSave || saving) && styles.saveDisabled]}
              onPress={save}
              disabled={!canSave || saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave || saving }}
            >
              <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar alterações'}</Text>
            </Pressable>

            {!!saveError && (
              <View style={styles.savedRow} accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle" size={s(16)} color={ui.signOut} />
                <Text style={[styles.savedText, { color: ui.signOut }]}>{saveError}</Text>
              </View>
            )}

            {saved && (
              <View style={styles.savedRow} accessibilityLiveRegion="polite">
                <Ionicons
                  name="checkmark-circle"
                  size={s(16)}
                  color={colors.primary}
                />
                <Text style={styles.savedText}>Alterações salvas</Text>
              </View>
            )}

            <Pressable
              style={styles.signOut}
              onPress={signOut}
              accessibilityRole="button"
            >
              <Ionicons
                name="log-out-outline"
                size={s(20)}
                color={ui.signOut}
              />
              <Text style={styles.signOutText}>Sair da conta</Text>
            </Pressable>
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
      borderColor: border,
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

    /* PERFIL */

    profileCard: {
      marginTop: s(16),
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      padding: s(16),
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: s(72),
      height: s(72),
      borderRadius: s(18),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },

    avatarImage: {
      width: '100%',
      height: '100%',
    },

    avatarText: {
      fontFamily: fonts.extrabold,
      fontSize: s(22),
      color: '#FFFFFF',
    },

    cameraBadge: {
      position: 'absolute',
      right: -s(6),
      bottom: -s(6),
      width: s(28),
      height: s(28),
      borderRadius: s(14),
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: ui.card,
      alignItems: 'center',
      justifyContent: 'center',
    },

    profileInfo: {
      flex: 1,
      marginLeft: s(16),
    },

    profileName: {
      fontFamily: fonts.extrabold,
      fontSize: s(18),
      color: colors.text,
    },

    profileEmail: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: 1,
    },

    changePhoto: {
      fontFamily: fonts.extrabold,
      fontSize: s(11),
      color: colors.primary,
      marginTop: s(8),
    },

    /* DADOS PESSOAIS */

    sectionLabel: {
      fontFamily: fonts.bold,
      fontSize: s(11),
      letterSpacing: 0.8,
      color: '#6F8481',
      marginTop: s(22),
      marginBottom: s(8),
    },

    formCard: {
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      paddingHorizontal: s(14),
    },

    field: {
      paddingVertical: s(12),
    },

    fieldDivider: {
      borderTopWidth: 1,
      borderTopColor: '#E3ECEA',
    },

    fieldLabel: {
      fontFamily: fonts.bold,
      fontSize: s(10),
      color: '#6F8481',
    },

    input: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.text,
      paddingVertical: s(8),
      borderBottomWidth: 1,
      borderBottomColor: 'transparent',
    },

    inputFocused: {
      borderBottomColor: colors.primary,
    },

    fieldError: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.signOut,
      marginTop: s(2),
    },

    /* SEGURANÇA */

    passwordCard: {
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      padding: s(14),
      flexDirection: 'row',
      alignItems: 'center',
    },

    passwordIcon: {
      width: s(40),
      height: s(40),
      borderRadius: s(10),
      backgroundColor: ui.tealSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    passwordTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.text,
    },

    passwordSubtitle: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: 1,
    },

    /* AÇÕES */

    saveButton: {
      marginTop: s(18),
      height: s(52),
      borderRadius: s(14),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    saveDisabled: {
      opacity: 0.45,
    },

    saveText: {
      fontFamily: fonts.extrabold,
      fontSize: s(13),
      color: '#FFFFFF',
    },

    savedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      marginTop: s(10),
    },

    savedText: {
      fontFamily: fonts.bold,
      fontSize: s(12),
      color: colors.primary,
    },

    signOut: {
      marginTop: s(14),
      height: s(52),
      borderRadius: s(14),
      backgroundColor: ui.signOutSoft,
      borderWidth: 1,
      borderColor: ui.signOutBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
    },

    signOutText: {
      fontFamily: fonts.extrabold,
      fontSize: s(13),
      color: ui.signOut,
    },
  }, dark));
}

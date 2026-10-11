import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { newPetDraft } from '@/services/newPetDraft';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

import PhoneFrame from '@/components/PhoneFrame';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';

/* ============================================================
   DADOS MOCK
   Quando existir login/API, troque por dados do usuário real.
============================================================ */

const user = {
  initials: 'AM',
  name: 'Arthur Mendonça',
  email: 'arthur@meupetseguro.app',
};

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  /** Linha com chevron (abre outra tela) */
  onPress?: () => void;
  /** Linha com interruptor */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  divider?: boolean;
};

/* ============================================================
   TELA
============================================================ */

export default function SettingsScreen() {
  const router = useRouter();

  // TODO: ligar ao tema do app e às permissões de notificação
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

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
    ],
  );

  function openAccount() {
    router.push('/minha-conta');
  }

  function addDevice() {
    newDeviceDraft.reset();
    newDeviceDraft.set({ origin: 'config' });
    router.push('/novo-dispositivo');
  }

  function addPet() {
    newPetDraft.reset();
    router.push('/novo-pet');
  }

  function signOut() {
    // TODO: limpar a sessão do usuário antes de voltar ao login
    router.replace('/login');
  }

  function Row({
    icon,
    title,
    subtitle,
    onPress,
    switchValue,
    onSwitchChange,
    divider,
  }: RowProps) {
    const isSwitch = switchValue !== undefined;

    const content = (
      <>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={s(22)} color={colors.primary} />
        </View>

        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </View>

        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#E4ECEB', true: colors.primary }}
            thumbColor="#FFFFFF"
            accessibilityLabel={title}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={s(18)}
            color={colors.text}
          />
        )}
      </>
    );

    const rowStyle = [styles.row, divider && styles.rowDivider];

    if (isSwitch) {
      return <View style={rowStyle}>{content}</View>;
    }

    return (
      <Pressable
        style={rowStyle}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <PhoneFrame active="settings">
      {/* Esconde o cabeçalho nativo; a tela tem o próprio */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* CABEÇALHO */}
          <Text style={styles.eyebrow}>PREFERÊNCIAS</Text>
          <Text style={styles.title}>Configurações</Text>

          {/* PERFIL */}
          <Pressable
            style={styles.profileCard}
            onPress={openAccount}
            accessibilityRole="button"
            accessibilityLabel={`${user.name}. Abrir minha conta`}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.initials}</Text>
            </View>

            <View style={styles.rowText}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={s(18)}
              color={colors.text}
            />
          </Pressable>

          {/* PREFERÊNCIAS */}
          <Text style={styles.sectionLabel}>PREFERÊNCIAS</Text>

          <View style={styles.group}>
            <Row
              icon="moon-outline"
              title="Modo escuro"
              subtitle="Visual confortável à noite"
              switchValue={darkMode}
              onSwitchChange={setDarkMode}
            />
          </View>

          {/* CUIDADOS E ALERTAS */}
          <Text style={styles.sectionLabel}>CUIDADOS E ALERTAS</Text>

          <View style={styles.group}>
            <Row
              icon="notifications-outline"
              title="Notificações"
              subtitle="Alertas em tempo real"
              switchValue={notifications}
              onSwitchChange={setNotifications}
              divider
            />

            <Row
              icon="options-outline"
              title="Limites de alerta"
              subtitle="Comida, água e atividade"
              // TODO: abrir a tela de limites de alerta
              onPress={() => router.navigate('/alertas')}
            />
          </View>

          {/* CASA CONECTADA */}
          <Text style={styles.sectionLabel}>CASA CONECTADA</Text>

          <View style={styles.group}>
            <Row
              icon="wifi-outline"
              title="Dispositivos"
              subtitle="Adicionar ou gerenciar"
              onPress={addDevice}
              divider
            />

            <Row
              icon="paw-outline"
              title="Adicionar novo pet"
              subtitle="Cadastre e conecte um dispositivo"
              onPress={addPet}
              divider
            />

            <Row
              icon="person-circle-outline"
              title="Minha conta"
              subtitle="Dados pessoais e segurança"
              onPress={openAccount}
            />
          </View>

          {/* SAIR */}
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

          <Text style={styles.version}>MeuPet Seguro · protótipo visual v1.0</Text>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}

/* ============================================================
   ESTILOS (dependem do tamanho da tela)
============================================================ */

function makeStyles({ s, isWeb, insetTop, navHeight }: Layout) {
  const border = '#D2E8E3';

  return StyleSheet.create({
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

    eyebrow: {
      fontFamily: fonts.bold,
      fontSize: s(11),
      letterSpacing: 0.8,
      color: '#6F8481',
    },

    title: {
      fontFamily: fonts.extrabold,
      fontSize: s(28),
      color: ui.strong,
      marginTop: s(2),
    },

    /* PERFIL */

    profileCard: {
      marginTop: s(16),
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      padding: s(14),
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: s(48),
      height: s(48),
      borderRadius: s(12),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: s(12),
    },

    avatarText: {
      fontFamily: fonts.extrabold,
      fontSize: s(16),
      color: '#FFFFFF',
    },

    profileName: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.text,
    },

    profileEmail: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: 1,
    },

    /* GRUPOS */

    sectionLabel: {
      fontFamily: fonts.bold,
      fontSize: s(11),
      letterSpacing: 0.8,
      color: '#6F8481',
      marginTop: s(22),
      marginBottom: s(8),
    },

    group: {
      backgroundColor: ui.card,
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: border,
      overflow: 'hidden',
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(14),
      paddingVertical: s(12),
    },

    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: '#E3ECEA',
    },

    rowIcon: {
      width: s(40),
      height: s(40),
      borderRadius: s(10),
      backgroundColor: ui.tealSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: s(12),
    },

    rowText: {
      flex: 1,
    },

    rowTitle: {
      fontFamily: fonts.extrabold,
      fontSize: s(14),
      color: colors.text,
    },

    rowSubtitle: {
      fontFamily: fonts.medium,
      fontSize: s(11),
      color: ui.muted,
      marginTop: 1,
    },

    /* SAIR */

    signOut: {
      marginTop: s(22),
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

    version: {
      fontFamily: fonts.medium,
      fontSize: s(10),
      color: '#8A9B99',
      textAlign: 'center',
      marginTop: s(16),
    },
  });
}

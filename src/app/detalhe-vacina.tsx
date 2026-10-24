import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PhoneFrame from '@/components/PhoneFrame';
import { useAppTheme } from '@/hooks/useAppTheme';
import { themed } from '@/constants/darkTheme';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';
import { errorMessage } from '@/services/api';
import { petService } from '@/services/petService';
import { vaccineService } from '@/services/vaccineService';
import { Vaccine, VaccineStatus } from '@/types/vaccine';
import { isoToBr } from '@/utils/dateFormat';
import { notify } from '@/utils/dialogs';

const STATUS_STYLE: Record<VaccineStatus, { bg: string; fg: string }> = {
  'Em dia': { bg: ui.tealSoft, fg: colors.primary },
  'Próxima do vencimento': { bg: '#F6E0B8', fg: '#9A6B00' },
  Atrasada: { bg: ui.signOutSoft, fg: ui.signOut },
};

type InfoIcon = keyof typeof Ionicons.glyphMap;

export default function VaccineDetailScreen() {
  const router = useRouter();
  const { vaccineId } = useLocalSearchParams<{ vaccineId?: string }>();

  const [vaccine, setVaccine] = useState<Vaccine | null>(null);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const layout = useLayout();
  const { dark, bg, tx } = useAppTheme();
  const { s } = layout;

  const styles = useMemo(
    () => makeStyles(layout, dark),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.frameWidth, layout.frameHeight, layout.insetTop, layout.insetBottom, layout.isWeb, dark],
  );

  // Recarrega ao voltar ao foco (ex.: depois de editar a vacina)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const found = vaccineId ? await vaccineService.get(vaccineId) : undefined;
          const pets = await petService.list();
          if (!active) return;
          setVaccine(found ?? null);
          setPetName(pets.find((p) => p.id === found?.petId)?.name ?? '');
          setLoadError(null);
        } catch (e) {
          if (active) setLoadError(errorMessage(e, 'Não foi possível carregar a vacina.'));
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [vaccineId]),
  );

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/carteira-vacinacao');
  }

  function edit() {
    if (!vaccine) return;
    router.push({ pathname: '/adicionar-vacina', params: { vaccineId: vaccine.id } });
  }

  async function confirmDelete() {
    if (!vaccine) return;
    try {
      setDeleting(true);
      await vaccineService.remove(vaccine.id);
      setConfirmOpen(false);
      goBack(); // a carteira recarrega ao voltar ao foco
    } catch (e) {
      setConfirmOpen(false);
      notify('Não foi possível remover', errorMessage(e, 'Tente novamente em instantes.'));
    } finally {
      setDeleting(false);
    }
  }

  const rows: { icon: InfoIcon; label: string; value: string }[] = vaccine
    ? [
        { icon: 'calendar-outline', label: 'DATA DE APLICAÇÃO', value: isoToBr(vaccine.appliedAt) },
        {
          icon: 'calendar-number-outline',
          label: 'PRÓXIMA DOSE',
          value: vaccine.nextDoseAt ? isoToBr(vaccine.nextDoseAt) : 'Não informada',
        },
        { icon: 'shield-checkmark-outline', label: 'OBSERVAÇÕES', value: vaccine.notes || 'Sem observações' },
      ]
    : [];

  return (
    <PhoneFrame active="pet">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* CABEÇALHO */}
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={goBack} accessibilityRole="button" accessibilityLabel="Voltar">
              <Ionicons name="chevron-back" size={s(22)} color={tx(colors.text)} />
            </Pressable>
            <Text style={styles.headerTitle}>Detalhe da vacina</Text>
            <View style={styles.backButtonSpacer} />
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: s(40) }} />
          ) : !vaccine ? (
            <View style={styles.notFound}>
              <Text style={styles.notFoundText}>{loadError ?? 'Esta vacina não foi encontrada.'}</Text>
              <Pressable onPress={goBack} hitSlop={8}>
                <Text style={styles.link}>Voltar para a carteira</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* RESUMO */}
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <MaterialCommunityIcons name="needle" size={s(26)} color={colors.primary} />
                </View>
                <Text style={styles.heroPet}>Vacina de {petName || 'seu pet'}</Text>
                <Text style={styles.heroName}>{vaccine.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: bg(STATUS_STYLE[vaccine.status].bg) }]}>
                  <Text style={[styles.statusText, { color: tx(STATUS_STYLE[vaccine.status].fg) }]}>{vaccine.status}</Text>
                </View>
              </View>

              {/* DADOS */}
              <View style={styles.infoCard}>
                {rows.map((row, index) => (
                  <View key={row.label} style={[styles.infoRow, index > 0 && styles.infoDivider]}>
                    <View style={styles.infoIcon}>
                      <Ionicons name={row.icon} size={s(16)} color={colors.primary} />
                    </View>
                    <View style={styles.infoTexts}>
                      <Text style={styles.infoLabel}>{row.label}</Text>
                      <Text style={styles.infoValue}>{row.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* AÇÕES */}
              <View style={styles.actions}>
                <Pressable style={styles.editButton} onPress={edit} accessibilityRole="button">
                  <Text style={styles.editText}>Editar vacina</Text>
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => setConfirmOpen(true)}
                  accessibilityRole="button"
                >
                  <Text style={styles.deleteText}>Excluir</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* CONFIRMAÇÃO (funciona no celular e no navegador) */}
      <Modal transparent animationType="fade" visible={confirmOpen} onRequestClose={() => setConfirmOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => !deleting && setConfirmOpen(false)}>
          <Pressable style={styles.dialog} onPress={() => {}}>
            <Text style={styles.dialogTitle}>Excluir vacina?</Text>
            <Text style={styles.dialogText}>
              O registro de {vaccine?.name ?? 'vacina'} será removido da carteira. Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.dialogActions}>
              <Pressable style={styles.dialogCancel} onPress={() => setConfirmOpen(false)} disabled={deleting}>
                <Text style={styles.dialogCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.dialogDelete} onPress={confirmDelete} disabled={deleting}>
                {deleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.dialogDeleteText}>Excluir</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </PhoneFrame>
  );
}

function makeStyles({ s, isWeb, insetTop, navHeight }: Layout, dark: boolean) {
  const border = '#D2E8E3';

  return StyleSheet.create(themed({
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

    heroCard: {
      alignItems: 'center', backgroundColor: ui.card, borderRadius: s(14), borderWidth: 1,
      borderColor: ui.cardBorder, paddingVertical: s(22), paddingHorizontal: s(16),
    },
    heroIcon: {
      width: s(56), height: s(56), borderRadius: s(14), backgroundColor: ui.tealSoft,
      alignItems: 'center', justifyContent: 'center', marginBottom: s(10),
    },
    heroPet: { fontFamily: fonts.medium, fontSize: s(12), color: '#6F8481' },
    heroName: { fontFamily: fonts.extrabold, fontSize: s(20), color: ui.strong, marginTop: s(4), textAlign: 'center' },
    statusBadge: { marginTop: s(10), borderRadius: s(10), paddingHorizontal: s(14), paddingVertical: s(5) },
    statusText: { fontFamily: fonts.bold, fontSize: s(11) },

    infoCard: {
      marginTop: s(16), backgroundColor: ui.card, borderRadius: s(14), borderWidth: 1,
      borderColor: ui.cardBorder, paddingHorizontal: s(14),
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: s(12), paddingVertical: s(12) },
    infoDivider: { borderTopWidth: 1, borderTopColor: '#E3ECEA' },
    infoIcon: {
      width: s(30), height: s(30), borderRadius: s(8), backgroundColor: ui.tealSoft,
      alignItems: 'center', justifyContent: 'center',
    },
    infoTexts: { flex: 1 },
    infoLabel: { fontFamily: fonts.bold, fontSize: s(9), letterSpacing: 0.6, color: '#6F8481' },
    infoValue: { fontFamily: fonts.medium, fontSize: s(12), color: colors.text, marginTop: s(2) },

    actions: { flexDirection: 'row', gap: s(12), marginTop: s(22) },
    editButton: {
      flex: 2, height: s(50), borderRadius: s(14), backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    editText: { fontFamily: fonts.extrabold, fontSize: s(13), color: '#FFFFFF' },
    deleteButton: {
      flex: 1, height: s(50), borderRadius: s(14), backgroundColor: ui.signOutSoft, borderWidth: 1,
      borderColor: ui.signOutBorder, alignItems: 'center', justifyContent: 'center',
    },
    deleteText: { fontFamily: fonts.extrabold, fontSize: s(13), color: ui.signOut },

    notFound: { alignItems: 'center', gap: s(10), marginTop: s(40) },
    notFoundText: { fontFamily: fonts.medium, fontSize: s(13), color: '#6F8481' },
    link: { fontFamily: fonts.extrabold, fontSize: s(13), color: colors.primary },

    backdrop: { flex: 1, backgroundColor: 'rgba(15,43,43,0.45)', alignItems: 'center', justifyContent: 'center', padding: s(24) },
    dialog: { width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: s(18), padding: s(20) },
    dialogTitle: { fontFamily: fonts.extrabold, fontSize: s(18), color: ui.strong },
    dialogText: { fontFamily: fonts.medium, fontSize: s(13), lineHeight: s(19), color: '#6F8481', marginTop: s(8) },
    dialogActions: { flexDirection: 'row', gap: s(12), marginTop: s(20) },
    dialogCancel: {
      flex: 1, height: s(46), borderRadius: s(12), borderWidth: 1, borderColor: border,
      alignItems: 'center', justifyContent: 'center',
    },
    dialogCancelText: { fontFamily: fonts.bold, fontSize: s(13), color: colors.primary },
    dialogDelete: {
      flex: 1, height: s(46), borderRadius: s(12), backgroundColor: ui.signOut,
      alignItems: 'center', justifyContent: 'center',
    },
    dialogDeleteText: { fontFamily: fonts.bold, fontSize: s(13), color: '#FFFFFF' },
  }, dark));
}

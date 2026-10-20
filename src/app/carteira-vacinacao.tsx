import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PhoneFrame from '@/components/PhoneFrame';
import { useAppTheme } from '@/hooks/useAppTheme';
import { themed } from '@/constants/darkTheme';
import { colors, fonts } from '@/constants/petTheme';
import { ui } from '@/constants/ui';
import { Layout, MAX_CONTENT_WIDTH, useLayout } from '@/hooks/useLayout';
import { petService } from '@/services/petService';
import { vaccineService } from '@/services/vaccineService';
import { Pet } from '@/types/pet';
import { Vaccine, VaccineStatus } from '@/types/vaccine';
import { isoToBr } from '@/utils/dateFormat';

const STATUS_STYLE: Record<VaccineStatus, { bg: string; fg: string }> = {
  'Em dia': { bg: ui.tealSoft, fg: colors.primary },
  'Próxima do vencimento': { bg: '#F6E0B8', fg: '#9A6B00' },
  Atrasada: { bg: ui.signOutSoft, fg: ui.signOut },
};

export default function VaccineWalletScreen() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();

  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);

  const layout = useLayout();
  const { dark, bg, tx } = useAppTheme();
  const { s } = layout;

  const styles = useMemo(
    () => makeStyles(layout, dark),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout.frameWidth, layout.frameHeight, layout.insetTop, layout.insetBottom, layout.isWeb, dark],
  );

  // Recarrega sempre que a tela volta ao foco (ex.: depois de adicionar uma vacina)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const pets = await petService.list();
        const current = pets.find((p) => p.id === petId) ?? pets[0] ?? null;
        const list = current ? await vaccineService.list(current.id) : [];
        if (active) {
          setPet(current);
          setVaccines(list);
        }
      })();
      return () => {
        active = false;
      };
    }, [petId]),
  );

  const total = vaccines.length;
  const upToDate = vaccines.filter((v) => v.status === 'Em dia').length;
  const attention = total - upToDate;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/meus-pets');
  }

  function addVaccine() {
    if (!pet) return;
    router.push({ pathname: '/adicionar-vacina', params: { petId: pet.id } });
  }

  function openDetails(vaccineId: string) {
    router.push({ pathname: '/detalhe-vacina', params: { vaccineId } });
  }

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
            <Text style={styles.headerTitle}>Carteira de Vacinação</Text>
            <View style={styles.backButtonSpacer} />
          </View>

          {pet && (
            <>
              {/* PET */}
              <View style={styles.petCard}>
                <View style={styles.petAvatar}>
                  {pet.photo ? (
                    <Image source={pet.photo} style={styles.petImage} resizeMode="cover" />
                  ) : (
                    <Ionicons name="paw" size={s(20)} color={colors.primary} />
                  )}
                </View>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petMeta}>
                    {pet.breed} · {pet.age} {pet.age === '1' ? 'ano' : 'anos'}
                  </Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{upToDate} em dia</Text>
                </View>
              </View>

              {/* RESUMO */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryKicker}>PROTEÇÃO DE {pet.name.toUpperCase()}</Text>
                <Text style={styles.summaryTitle}>
                  {total} {total === 1 ? 'vacina registrada' : 'vacinas registradas'}
                </Text>
                <Text style={styles.summaryText}>
                  {total === 0
                    ? 'Nenhuma dose registrada ainda'
                    : attention === 0
                      ? 'Todas as doses estão em dia'
                      : `${attention} ${attention === 1 ? 'dose precisa' : 'doses precisam'} de atenção`}
                </Text>
              </View>

              {/* HISTÓRICO */}
              <View style={styles.historyHeader}>
                <Text style={styles.historyLabel}>Histórico</Text>
                <Pressable onPress={addVaccine} hitSlop={8} accessibilityRole="button">
                  <Text style={styles.addLink}>+ Adicionar vacina</Text>
                </Pressable>
              </View>
              <Text style={styles.listTitle}>Vacinas cadastradas</Text>

              {total === 0 ? (
                <View style={styles.empty}>
                  <MaterialCommunityIcons name="needle" size={s(26)} color={colors.primary} />
                  <Text style={styles.emptyText}>
                    Nenhuma vacina cadastrada. Toque em "+ Adicionar vacina" para registrar a primeira dose.
                  </Text>
                </View>
              ) : (
                vaccines.map((v) => (
                  <Pressable key={v.id} style={styles.vaccineCard} onPress={() => openDetails(v.id)} accessibilityRole="button">
                    <View style={styles.vaccineIcon}>
                      <MaterialCommunityIcons name="needle" size={s(18)} color={colors.primary} />
                    </View>

                    <View style={styles.vaccineInfo}>
                      <Text style={styles.vaccineName}>{v.name}</Text>
                      <Text style={styles.vaccineDate}>Aplicada em {isoToBr(v.appliedAt)}</Text>
                      {!!v.nextDoseAt && <Text style={styles.vaccineDate}>Próxima: {isoToBr(v.nextDoseAt)}</Text>}
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: bg(STATUS_STYLE[v.status].bg) }]}>
                      <Text style={[styles.statusText, { color: tx(STATUS_STYLE[v.status].fg) }]}>{v.status}</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={s(18)} color={tx(colors.text)} />
                  </Pressable>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
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

    petCard: {
      flexDirection: 'row', alignItems: 'center', gap: s(12), backgroundColor: ui.card, borderRadius: s(12),
      borderWidth: 1, borderColor: ui.cardBorder, padding: s(10),
    },
    petAvatar: {
      width: s(40), height: s(40), borderRadius: s(10), overflow: 'hidden', backgroundColor: ui.tealSoft,
      alignItems: 'center', justifyContent: 'center',
    },
    petImage: { width: '100%', height: '100%' },
    petInfo: { flex: 1 },
    petName: { fontFamily: fonts.bold, fontSize: s(14), color: colors.text },
    petMeta: { fontFamily: fonts.medium, fontSize: s(11), color: '#6F8481', marginTop: 1 },
    countBadge: { backgroundColor: ui.tealSoft, borderRadius: s(12), paddingHorizontal: s(12), paddingVertical: s(4) },
    countBadgeText: { fontFamily: fonts.bold, fontSize: s(11), color: colors.primary },

    summaryCard: { marginTop: s(14), backgroundColor: colors.primary, borderRadius: s(14), padding: s(18) },
    summaryKicker: { fontFamily: fonts.bold, fontSize: s(10), letterSpacing: 0.8, color: '#BDEBE6' },
    summaryTitle: { fontFamily: fonts.extrabold, fontSize: s(18), color: '#FFFFFF', marginTop: s(6) },
    summaryText: { fontFamily: fonts.medium, fontSize: s(12), color: '#D7F3EF', marginTop: s(4) },

    historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: s(22) },
    historyLabel: { fontFamily: fonts.medium, fontSize: s(13), color: '#6F8481' },
    addLink: { fontFamily: fonts.extrabold, fontSize: s(12), color: colors.primary },
    listTitle: { fontFamily: fonts.extrabold, fontSize: s(18), color: ui.strong, marginTop: s(2), marginBottom: s(12) },

    vaccineCard: {
      flexDirection: 'row', alignItems: 'center', gap: s(10), backgroundColor: ui.card, borderRadius: s(12),
      borderWidth: 1, borderColor: ui.cardBorder, padding: s(12), marginBottom: s(10),
    },
    vaccineIcon: {
      width: s(32), height: s(32), borderRadius: s(8), backgroundColor: ui.tealSoft,
      alignItems: 'center', justifyContent: 'center',
    },
    vaccineInfo: { flex: 1 },
    vaccineName: { fontFamily: fonts.bold, fontSize: s(13), color: colors.text },
    vaccineDate: { fontFamily: fonts.medium, fontSize: s(10), color: '#6F8481', marginTop: 1 },
    statusBadge: { borderRadius: s(10), paddingHorizontal: s(10), paddingVertical: s(4), maxWidth: s(96) },
    statusText: { fontFamily: fonts.bold, fontSize: s(9), textAlign: 'center' },

    empty: {
      alignItems: 'center', gap: s(8), backgroundColor: ui.card, borderRadius: s(12), borderWidth: 1,
      borderColor: ui.cardBorder, padding: s(20),
    },
    emptyText: { fontFamily: fonts.medium, fontSize: s(12), lineHeight: s(18), color: '#6F8481', textAlign: 'center' },
  }, dark));
}

import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { themed } from '@/constants/darkTheme';
import { colors, fonts, radius, shadow, spacing } from '@/constants/petTheme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { newDeviceDraft } from '@/services/newDeviceDraft';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { ReactNode, useMemo } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_STEPS = 5;
const MAX_WIDTH = 460;

type Props = { step: 1 | 2 | 3 | 4 | 5; onBack: () => void; children: ReactNode };

/** Estrutura das 5 etapas de "Novo dispositivo": voltar, título, progresso, conteúdo e barra inferior. */
export function DeviceFlowLayout({ step, onBack, children }: Props) {
  const goToTab = useTabNavigation();
  const { dark, tx } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const activeTab = newDeviceDraft.get().origin === 'config' ? 'config' : 'meus-pets';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.back} onPress={onBack} accessibilityLabel="Voltar">
                <Ionicons name="chevron-back" size={22} color={tx(colors.text)} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Novo dispositivo</Text>
              <View style={styles.backSpacer} />
            </View>

            <View style={styles.progressRow}>
              <View style={styles.bars}>
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <View key={i} style={[styles.bar, i < step && styles.barDone]} />
                ))}
              </View>
              <Text style={styles.stepText}>ETAPA {step} DE {TOTAL_STEPS}</Text>
            </View>

            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomTabBar active={activeTab} onPress={goToTab} />
    </SafeAreaView>
  );
}

/** Cabeçalho de cada etapa: rótulo pequeno, título e texto de apoio. */
export function DeviceStepHeader({
  kicker, title, subtitle, center,
}: { kicker: string; title: string; subtitle?: string; center?: boolean }) {
  const { dark } = useAppTheme();
  const styles = useMemo(() => makeStyles(dark), [dark]);
  const align = center ? ({ textAlign: 'center' } as const) : undefined;
  return (
    <View style={{ marginBottom: spacing.lg, alignItems: center ? 'center' : 'stretch' }}>
      <Text style={[styles.kicker, align]}>{kicker}</Text>
      <Text style={[styles.title, align]}>{title}</Text>
      {!!subtitle && <Text style={[styles.subtitle, align]}>{subtitle}</Text>}
    </View>
  );
}

const makeStyles = (dark: boolean) => StyleSheet.create(themed({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.lg },
  inner: { width: '100%', maxWidth: MAX_WIDTH },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  back: {
    width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
    ...shadow, shadowOpacity: 0.08,
  },
  backSpacer: { width: 40 },
  headerTitle: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.text },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.lg },
  bars: { flex: 1, flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E1EEEC' },
  barDone: { backgroundColor: colors.primary },
  stepText: { fontFamily: fonts.bold, fontSize: 9, color: colors.textMuted },
  kicker: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  title: { fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 28, color: colors.text },
  subtitle: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: 8 },
}, dark));

import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, spacing } from '@/constants/petTheme';

const TOTAL_STEPS = 4;
const MAX_WIDTH = 460;

type Props = { step: 1 | 2 | 3 | 4; onBack: () => void; children: ReactNode };

/** Estrutura comum das 4 etapas de cadastro: botão voltar, título, progresso e conteúdo no topo. */
export function NewPetLayout({ step, onBack, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
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
                <Ionicons name="chevron-back" size={22} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Novo pet</Text>
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
    </SafeAreaView>
  );
}

/** Rótulo pequeno em maiúsculas acima do título (ex.: "PERFIL DO PET"). */
export function StepKicker({ children }: { children: string }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

export function StepTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function StepSubtitle({ children }: { children: ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.xl },
  inner: { width: '100%', maxWidth: MAX_WIDTH },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  back: {
    width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', ...shadow, shadowOpacity: 0.1,
  },
  backSpacer: { width: 44 },
  headerTitle: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.text },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.lg },
  bars: { flex: 1, flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E1EEEC' },
  barDone: { backgroundColor: colors.primary },
  stepText: { fontFamily: fonts.bold, fontSize: 9, color: colors.textMuted },
  kicker: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2, color: colors.textMuted, marginBottom: 6 },
  title: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32, color: colors.text },
  subtitle: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.textMuted, marginTop: 8, marginBottom: spacing.lg },
});

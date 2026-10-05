import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useResponsive } from '@/hooks/useResponsive';
import { colors, fonts, radius, shadow, spacing } from '@/constants/petTheme';

/**
 * HOME PROVISÓRIA — existe só para testar o fluxo de login.
 * Será substituída pela Home real (abas) nas próximas etapas.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { ms } = useResponsive();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Logo size={90} />
        <Text style={[styles.title, { fontSize: ms(24) }]}>Login realizado!</Text>
        <Text style={[styles.subtitle, { fontSize: ms(14) }]}>
          Esta é uma tela provisória de teste.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color="#fff" />
          <Text style={styles.badgeText}>Tudo tranquilo</Text>
        </View>
        <Text style={[styles.cardTitle, { fontSize: ms(22) }]}>Rex está descansando</Text>
        <Text style={styles.cardText}>Casa conectada · Atualizado agora</Text>
      </View>

      <Button title="Sair" onPress={() => router.replace('/login')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.lg },
  title: { fontFamily: fonts.extrabold, color: colors.text, marginTop: 4, textAlign: 'center' },
  subtitle: { fontFamily: fonts.medium, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.lg, ...shadow,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 6, marginBottom: spacing.md,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 12, color: '#fff' },
  cardTitle: { fontFamily: fonts.extrabold, color: '#fff' },
  cardText: { fontFamily: fonts.medium, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
});

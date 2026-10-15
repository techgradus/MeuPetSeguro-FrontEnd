import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radius, spacing } from '@/constants/petTheme';

type Props = {
  loading?: boolean;
  error?: string | null;
  onAdd: () => void;
  onRetry?: () => void;
};

/** Estado das telas que dependem dos pets: carregando, erro ou nenhum pet cadastrado ainda. */
export function EmptyPetsNotice({ loading, error, onAdd, onRetry }: Props) {
  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.box}>
        <Ionicons name="cloud-offline-outline" size={40} color={colors.primary} />
        <Text style={styles.title}>Não foi possível carregar</Text>
        <Text style={styles.text}>{error}</Text>
        {!!onRetry && <Button title="Tentar novamente" onPress={onRetry} />}
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <View style={styles.iconCircle}>
        <Ionicons name="paw-outline" size={34} color={colors.primary} />
      </View>
      <Text style={styles.title}>Nenhum pet cadastrado</Text>
      <Text style={styles.text}>Cadastre seu primeiro pet para acompanhar a rotina dele por aqui.</Text>
      <Button title="Cadastrar meu primeiro pet" onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: radius.xl, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.text, textAlign: 'center' },
  text: {
    fontFamily: fonts.medium, fontSize: 13, lineHeight: 19, color: colors.textMuted,
    textAlign: 'center', maxWidth: 300,
  },
});
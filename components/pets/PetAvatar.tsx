import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow } from '@/constants/petTheme';

type Props = { source?: ImageSourcePropType; size?: number; onPress?: () => void };

const BORDER = 6;

/** Foto de perfil do pet: quadrado arredondado, borda branca e botão "+" para trocar a foto. */
export function PetAvatar({ source, size = 150, onPress }: Props) {
  const inner = size - BORDER * 2;
  const innerRadius = radius.xl - BORDER;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} accessibilityLabel="Trocar foto do pet">
        <View style={[styles.frame, { width: size, height: size }]}>
          {/* Contêiner de tamanho fixo que recorta a foto: ela nunca ultrapassa a moldura */}
          <View style={{ width: inner, height: inner, borderRadius: innerRadius, overflow: 'hidden' }}>
            {source ? (
              <Image source={source} resizeMode="cover" style={{ width: inner, height: inner }} />
            ) : (
              <View style={[styles.placeholder, { width: inner, height: inner }]}>
                <Ionicons name="paw" size={size * 0.35} color={colors.primary} />
              </View>
            )}
          </View>
        </View>
        <View style={styles.plus}>
          <Ionicons name="add" size={18} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={styles.hint}>Toque para trocar a foto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', alignSelf: 'center' },
  frame: {
    padding: BORDER, borderRadius: radius.xl, backgroundColor: colors.surface, ...shadow, shadowOpacity: 0.12,
  },
  placeholder: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  plus: {
    position: 'absolute', right: -6, bottom: -6, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  hint: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 14 },
});

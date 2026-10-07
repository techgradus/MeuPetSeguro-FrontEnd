import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pet } from '@/types/pet';
import { colors, fonts, radius } from '@/constants/petTheme';

type Props = { pets: Pet[]; selectedId: string; onSelect: (id: string) => void };

export function PetSelector({ pets, selectedId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {pets.map((pet) => {
        const selected = pet.id === selectedId;
        return (
          <TouchableOpacity
            key={pet.id}
            activeOpacity={0.85}
            onPress={() => onSelect(pet.id)}
            style={[styles.card, selected ? styles.cardSelected : styles.cardIdle]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <View style={styles.thumb}>
              {pet.photo ? (
                <Image source={pet.photo} style={styles.thumbImg} />
              ) : (
                <Ionicons name="paw" size={16} color={colors.primary} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{pet.name}</Text>
              <Text style={styles.species}>{pet.species}</Text>
            </View>
            {selected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12, paddingVertical: 2 },
  card: {
    minWidth: 150, flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: radius.md,
  },
  cardSelected: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  cardIdle: { backgroundColor: colors.primaryLight, borderWidth: 1.5, borderColor: 'transparent' },
  thumb: {
    width: 36, height: 36, borderRadius: 10, overflow: 'hidden',
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  thumbImg: { width: '100%', height: '100%' },
  info: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  species: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted },
});

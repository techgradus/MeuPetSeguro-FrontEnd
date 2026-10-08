import React from 'react';
import { Image, Text, View } from 'react-native';

import type { Pet } from '@/data/pets';

type Props = {
  pet: Pet;
  size: number;
  radius: number;
  emojiSize: number;
};

/** Mostra a foto do pet; se não houver foto, mostra o emoji. */
export default function PetAvatar({ pet, size, radius, emojiSize }: Props) {
  const box = { width: size, height: size, borderRadius: radius };

  if (pet.photo) {
    return <Image source={pet.photo} style={box} resizeMode="cover" />;
  }

  return (
    <View
      style={[
        box,
        {
          backgroundColor: '#F1F1F1',
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <Text style={{ fontSize: emojiSize }}>{pet.emoji}</Text>
    </View>
  );
}

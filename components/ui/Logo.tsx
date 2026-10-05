import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type Props = { size?: number; style?: StyleProp<ImageStyle> };

export function Logo({ size = 120, style }: Props) {
  return (
    <Image
      source={require('@/assets/images/logo.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="Logo Meu Pet Seguro"
    />
  );
}

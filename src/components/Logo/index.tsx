import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

// The MonoScrum logo — used everywhere branding appears
const LOGO = require('../../../assets/logo.png');

interface Props {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function Logo({ size = 40, style }: Props) {
  return (
    <Image
      source={LOGO}
      style={[{ width: size, height: size, borderRadius: size * 0.22 }, style]}
      resizeMode="contain"
    />
  );
}

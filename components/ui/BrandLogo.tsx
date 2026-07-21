import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type Props = {
  /** Logo height in px (width follows aspect). */
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/**
 * Bare logo image — no View wrapper, no card, no shadow, no fill.
 * Uses transparent PNG (assets/images/logo.png).
 */
export function BrandLogo({ size = 120, style }: Props) {
  return (
    <Image
      source={require('../../assets/images/logo.png')}
      style={[
        {
          width: size * 1.15,
          height: size,
          backgroundColor: 'transparent',
          // kill any platform “card” look
          shadowColor: 'transparent',
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: 0,
        },
        style,
      ]}
      resizeMode="contain"
      accessibilityLabel="Decor AI"
    />
  );
}

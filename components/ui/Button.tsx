import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Radii, Shadow, Type } from '../../constants/theme';
import { Palette, useColors } from '../../lib/theme';

type Props = {
  title: string; onPress: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean; disabled?: boolean; style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, style }: Props) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && [styles.primary, Shadow.float],
        variant === 'ghost' && styles.ghost,
        variant === 'outline' && styles.outline,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? C.onPrimary : C.primary} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={isPrimary ? C.onPrimary : C.text} />}
          <Text
            style={[styles.label, { color: isPrimary ? C.onPrimary : C.text }]}
            numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 54, borderRadius: Radii.lg, paddingHorizontal: 12,
  },
  // labels never wrap — they shrink to fit on one line instead
  primary: { backgroundColor: C.primary },
  ghost: { backgroundColor: C.accentSoft },
  outline: { borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card },
  label: { ...Type.subtitle, flexShrink: 1 },
});

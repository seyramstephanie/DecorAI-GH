import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '../../lib/theme';

/**
 * App-side stand-in for a soft WebGL / Three.js ambient mesh —
 * drifting gradient orbs behind product heroes (no native GL required).
 */
export function MeshBackdrop({ height = 420 }: { height?: number }) {
  const C = useColors();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [t]);

  const a = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-24, 36]) },
      { translateY: interpolate(t.value, [0, 1], [10, -28]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.15]) },
    ],
    opacity: interpolate(t.value, [0, 0.5, 1], [0.55, 0.85, 0.6]),
  }));

  const b = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [40, -20]) },
      { translateY: interpolate(t.value, [0, 1], [-16, 30]) },
      { scale: interpolate(t.value, [0, 1], [1.1, 0.95]) },
    ],
    opacity: interpolate(t.value, [0, 0.5, 1], [0.45, 0.7, 0.5]),
  }));

  const c = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-10, 18]) },
      { translateY: interpolate(t.value, [0, 1], [20, -12]) },
    ],
    opacity: interpolate(t.value, [0, 1], [0.35, 0.55]),
  }));

  return (
    <View style={[styles.wrap, { height }]} pointerEvents="none">
      <LinearGradient
        colors={[C.bg, C.accentSoft, C.bg]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.blob, styles.blobA, a, { backgroundColor: C.primaryLight }]} />
      <Animated.View style={[styles.blob, styles.blobB, b, { backgroundColor: C.terracotta }]} />
      <Animated.View style={[styles.blob, styles.blobC, c, { backgroundColor: C.accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.5 },
  blobA: { width: 220, height: 220, top: 40, left: -40 },
  blobB: { width: 260, height: 260, top: 80, right: -60 },
  blobC: { width: 160, height: 160, bottom: 20, left: '35%' },
});

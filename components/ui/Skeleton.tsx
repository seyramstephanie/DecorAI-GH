import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Radii } from '../../constants/theme';
import { useColors } from '../../lib/theme';

/** Soft pulse skeleton block for slow lists / dashboards. */
export function Skeleton({
  height = 16,
  width = '100%' as number | `${number}%`,
  radius = Radii.sm,
  style,
}: {
  height?: number;
  width?: number | `${number}%`;
  radius?: number;
  style?: ViewStyle;
}) {
  const C = useColors();
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);
  const anim = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.85]),
  }));
  return (
    <Animated.View
      style={[
        {
          height,
          width: width as any,
          borderRadius: radius,
          backgroundColor: C.cardMuted,
        },
        anim,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const C = useColors();
  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: C.card, borderRadius: Radii.md, padding: 16, gap: 10, marginBottom: 12,
    },
  }), [C]);
  return (
    <View style={styles.card}>
      <Skeleton height={120} radius={Radii.sm} />
      <Skeleton height={16} width="70%" />
      <Skeleton height={12} width="45%" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton height={28} width={72} radius={14} />
        <Skeleton height={28} width={72} radius={14} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

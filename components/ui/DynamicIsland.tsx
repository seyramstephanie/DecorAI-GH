import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Type } from '../../constants/theme';
import { Palette, useColors } from '../../lib/theme';
import { Glass } from './Glass';

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onDismiss?: () => void;
};

/**
 * Apple Dynamic Island–style compact pill for transient system status
 * (new message, Google sign-in, payment success). Sits under the status bar.
 */
export function DynamicIsland({ visible, title, subtitle, icon = 'sparkles', onPress, onDismiss }: Props) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = visible
      ? withSpring(1, { damping: 16, stiffness: 180 })
      : withTiming(0, { duration: 180 });
  }, [visible, progress]);

  const anim = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * -12 },
      { scale: 0.92 + progress.value * 0.08 },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, { top: Math.max(insets.top - 2, 8) }, anim]}>
      <Pressable onPress={onPress} onLongPress={onDismiss}>
        <Glass
          isInteractive
          glassEffectStyle="regular"
          tintColor="rgba(20,16,12,0.55)"
          style={styles.pill}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={14} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {!!subtitle && <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
        </Glass>
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 48,
    right: 48,
    zIndex: 100,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...Type.caption, color: '#fff', fontWeight: '700', fontSize: 12 },
  sub: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 1 },
});

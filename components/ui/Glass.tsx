import { BlurView } from 'expo-blur';
import {
  GlassView as ExpoGlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassStyle,
} from 'expo-glass-effect';
import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Radii, Type } from '../../constants/theme';
import { useStore } from '../../lib/store';
import { useColors } from '../../lib/theme';

/** Cached once per JS runtime — Apple Liquid Glass (iOS 26+ real device / supported builds). */
let _liquidGlassCached: boolean | null = null;

/** True when native Apple Liquid Glass can render. */
export function canUseLiquidGlass(): boolean {
  if (_liquidGlassCached != null) return _liquidGlassCached;
  if (Platform.OS !== 'ios') {
    _liquidGlassCached = false;
    return false;
  }
  try {
    _liquidGlassCached = Boolean(isLiquidGlassAvailable?.() && isGlassEffectAPIAvailable?.());
  } catch {
    _liquidGlassCached = false;
  }
  return _liquidGlassCached;
}

type GlassProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Apple glass style — only used when Liquid Glass is available. */
  glassEffectStyle?: GlassStyle;
  /** Interactive liquid glass (set once on mount). */
  isInteractive?: boolean;
  tintColor?: string;
  intensity?: 'soft' | 'strong';
};

/**
 * Real Liquid Glass via expo-glass-effect (iOS 26+).
 * Falls back to expo-blur on other platforms / older iOS.
 */
export function Glass({
  children,
  style,
  glassEffectStyle = 'regular',
  isInteractive = false,
  tintColor,
  intensity = 'soft',
}: GlassProps) {
  const C = useColors();
  const dark = useStore().prefs.darkMode;
  const liquid = canUseLiquidGlass();
  const tint = tintColor ?? (dark ? 'rgba(34,27,21,0.35)' : 'rgba(250,247,244,0.28)');

  if (liquid) {
    return (
      <ExpoGlassView
        style={[styles.clip, style]}
        glassEffectStyle={glassEffectStyle}
        isInteractive={isInteractive}
        tintColor={tint}
        // Follow app dark-mode toggle (not only system appearance)
        colorScheme={dark ? 'dark' : 'light'}
      >
        {children}
      </ExpoGlassView>
    );
  }

  // Blur fallback (Android / web / older iOS)
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return (
      <BlurView
        intensity={intensity === 'strong' ? 55 : 35}
        tint={dark ? 'dark' : 'light'}
        style={[styles.clip, styles.blurBorder, { borderColor: C.border }, style]}
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: dark ? 'rgba(34,27,21,0.45)' : 'rgba(255,255,255,0.35)' }]} />
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.clip, { backgroundColor: C.card, borderColor: C.border, borderWidth: StyleSheet.hairlineWidth }, style]}>
      {children}
    </View>
  );
}

/** Card-shaped glass surface used across screens. */
export function GlassCard({
  children,
  style,
  intensity = 'soft',
  isInteractive = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: 'soft' | 'strong';
  isInteractive?: boolean;
}) {
  return (
    <Glass
      intensity={intensity}
      isInteractive={isInteractive}
      glassEffectStyle={intensity === 'strong' ? 'clear' : 'regular'}
      style={[styles.card, style]}
    >
      {children}
    </Glass>
  );
}

/** Pill / dropdown chip on glass — fixed height so filter rails stay stable. */
export function GlassPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const C = useColors();
  if (active) {
    return (
      <Pressable onPress={onPress} style={[styles.pill, { backgroundColor: C.primary }]}>
        <Text style={[styles.pillLabel, { color: C.onPrimary }]} numberOfLines={1}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={styles.pillHit}>
      <Glass isInteractive glassEffectStyle="clear" style={styles.pill}>
        <Text style={[styles.pillLabel, { color: C.text }]} numberOfLines={1}>{label}</Text>
      </Glass>
    </Pressable>
  );
}

/** Circular glass icon toggle (category chips). */
export function GlassIconToggle({
  active,
  onPress,
  children,
  size = 58,
}: {
  active?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  size?: number;
}) {
  const C = useColors();
  if (active) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
        }}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress}>
      <Glass
        isInteractive
        glassEffectStyle="clear"
        style={{
          width: size, height: size, borderRadius: size / 2,
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}
      >
        {children}
      </Glass>
    </Pressable>
  );
}

/**
 * Settings row with liquid-glass track around the switch.
 *
 * Important: never paint a fully opaque track when ON — that covered the glass
 * and made it look like liquid glass “stopped working” half the time.
 */
export function GlassToggleRow({
  label,
  value,
  onValueChange,
  last,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
}) {
  const C = useColors();
  const dark = useStore().prefs.darkMode;
  const liquid = canUseLiquidGlass();
  const stylesLocal = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingVertical: 12, minHeight: 54,
      borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    label: { ...Type.body, fontSize: 15, fontWeight: '600', color: C.text, flex: 1 },
    glassSwitch: {
      borderRadius: 20,
      paddingHorizontal: 5,
      paddingVertical: 3,
      overflow: 'hidden',
      // Soft rim so glass is visible even on solid card backgrounds
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(31,26,22,0.08)',
    },
  }), [C, last, dark]);

  // Translucent tracks keep blur/liquid glass visible in both states
  const trackOff = dark ? 'rgba(255,255,255,0.12)' : 'rgba(31,26,22,0.10)';
  const trackOn = dark ? 'rgba(193,101,59,0.55)' : 'rgba(154,74,31,0.50)';

  return (
    <View style={stylesLocal.row}>
      <Text style={stylesLocal.label}>{label}</Text>
      <Glass
        isInteractive={liquid}
        glassEffectStyle="clear"
        intensity="strong"
        // Warm tint when ON so “active” still reads without hiding glass
        tintColor={value
          ? (dark ? 'rgba(193,101,59,0.28)' : 'rgba(154,74,31,0.22)')
          : undefined}
        style={stylesLocal.glassSwitch}
      >
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: trackOff, true: trackOn }}
          thumbColor={C.white}
          ios_backgroundColor={trackOff}
        />
      </Glass>
    </View>
  );
}

/** Compact glass select / dropdown option. */
export function GlassOption({
  label,
  sub,
  active,
  onPress,
  icon,
}: {
  label: string;
  sub?: string;
  active?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  const C = useColors();
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Glass
        isInteractive
        glassEffectStyle={active ? 'regular' : 'clear'}
        tintColor={active ? 'rgba(154,74,31,0.35)' : undefined}
        style={[
          styles.option,
          active && { borderColor: C.primary, borderWidth: 1.5 },
        ]}
      >
        {icon}
        <Text style={[styles.optionTitle, { color: active ? C.primary : C.text }]}>{label}</Text>
        {!!sub && <Text style={[styles.optionSub, { color: C.textLight }]}>{sub}</Text>}
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  blurBorder: { borderWidth: StyleSheet.hairlineWidth },
  card: { borderRadius: Radii.lg, overflow: 'hidden' },
  pillHit: { height: 36, borderRadius: 18, overflow: 'hidden' },
  pill: {
    paddingHorizontal: 16, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  pillLabel: { ...Type.caption, fontSize: 13, fontWeight: '600' },
  option: {
    borderRadius: Radii.md, padding: 12, alignItems: 'center', gap: 4, overflow: 'hidden',
  },
  optionTitle: { ...Type.caption, fontSize: 13, fontWeight: '700' },
  optionSub: { fontSize: 10, textAlign: 'center' },
});

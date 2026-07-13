import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Type } from '../../constants/theme';
import { Palette, useColors } from '../../lib/theme';

// Category chip per UI reference: circular icon button with label underneath.
type Props = {
  label: string; active?: boolean; onPress: () => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function CategoryChip({ label, active, onPress, icon }: Props) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <Pressable onPress={onPress} style={[styles.circle, active && styles.circleActive]}>
        <MaterialCommunityIcons name={icon} size={24} color={active ? C.onPrimary : C.textMuted} />
      </Pressable>
      <Text style={[styles.label, active && { color: C.text, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

// Simple pill chip (filters, styles, event types)
export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillLabel, active && { color: C.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, width: 68 },
  circle: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: C.cardMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  circleActive: { backgroundColor: C.primary },
  label: { ...Type.caption, color: C.textMuted },
  pill: {
    paddingHorizontal: 16, height: 38, borderRadius: 19, backgroundColor: C.cardMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  pillActive: { backgroundColor: C.primary },
  pillLabel: { ...Type.caption, fontSize: 13, color: C.textMuted },
});

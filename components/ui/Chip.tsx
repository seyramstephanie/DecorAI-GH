import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Type } from '../../constants/theme';
import { Palette, useColors } from '../../lib/theme';
import { GlassIconToggle, GlassPill } from './Glass';

// Category chip — glass circle when idle, primary fill when active.
type Props = {
  label: string; active?: boolean; onPress: () => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function CategoryChip({ label, active, onPress, icon }: Props) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={styles.wrap}>
      <GlassIconToggle active={active} onPress={onPress}>
        <MaterialCommunityIcons name={icon} size={24} color={active ? C.onPrimary : C.textMuted} />
      </GlassIconToggle>
      <Text style={[styles.label, active && { color: C.text, fontWeight: '700' }]}>{label}</Text>
    </View>
  );
}

/** Filter / style pill — liquid glass when idle. */
export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return <GlassPill label={label} active={active} onPress={onPress} />;
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, width: 68 },
  label: { ...Type.caption, color: C.textMuted },
});

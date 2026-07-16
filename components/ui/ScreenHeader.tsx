import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Type } from '../../constants/theme';
import { Palette, useColors } from '../../lib/theme';
import { Glass, GlassIconToggle } from './Glass';

export function ScreenHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  return (
    <View style={styles.row}>
      <GlassIconToggle size={40} onPress={() => router.replace('/home')}>
        <Ionicons name="arrow-back" size={20} color={C.text} />
      </GlassIconToggle>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

export function EmptyState({ icon, title, body }: { icon: any; title: string; body: string }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={styles.empty}>
      <Glass glassEffectStyle="clear" style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={C.primaryLight} />
      </Glass>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 14, gap: 8,
  },
  title: { ...Type.title, color: C.text, flex: 1, textAlign: 'center' },
  right: { width: 40, alignItems: 'flex-end' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40, gap: 10 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4, overflow: 'hidden',
  },
  emptyTitle: { ...Type.subtitle, color: C.text },
  emptyBody: { ...Type.body, color: C.textMuted, textAlign: 'center', lineHeight: 20 },
});

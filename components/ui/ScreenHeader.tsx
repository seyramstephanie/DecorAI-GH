import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Type } from '../../constants/theme';
import { Palette, useColors } from '../../lib/theme';

export function ScreenHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={C.text} />
      </Pressable>
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
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={C.primaryLight} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 8, paddingBottom: 14,
  },
  back: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.cardMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...Type.title, color: C.text, flex: 1, textAlign: 'center' },
  right: { width: 40, alignItems: 'flex-end' },
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40, gap: 10 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { ...Type.subtitle, color: C.text },
  emptyBody: { ...Type.body, color: C.textMuted, textAlign: 'center', lineHeight: 20 },
});

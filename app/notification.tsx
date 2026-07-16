import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/ui/Glass';
import { EmptyState, ScreenHeader } from '../components/ui/ScreenHeader';
import { SkeletonList } from '../components/ui/Skeleton';
import { Radii, Type } from '../constants/theme';
import { api, Notification } from '../lib/api';
import { session } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

const ICONS: Record<Notification['type'], any> = {
  radius: 'megaphone-outline', brief: 'document-text-outline', booking: 'calendar-outline',
  digest: 'sparkles-outline', stock: 'cube-outline',
};

const timeAgo = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

export default function Notifications() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [rows, setRows] = useState<Notification[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<Notification[]>(`/notifications?userId=${session.user?.id ?? 'guest'}`)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const markRead = (n: Notification) => {
    if (n.read) return;
    setRows((r) => r.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    api.patch(`/notifications/${n.id}/read`, {}).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Notifications" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {error && <EmptyState icon="cloud-offline-outline" title="Backend offline" body="Start it with: npm run server." />}
        {loading && !error && <SkeletonList count={5} />}
        {!loading && !error && rows.length === 0 && (
          <EmptyState
            icon="notifications-outline"
            title="No notifications yet"
            body="Welcome messages, password resets, booking updates and shop alerts will show up here."
          />
        )}
        {!loading && rows.map((n, i) => (
          <Animated.View key={`${n.id}-${i}`} entering={FadeInDown.delay(Math.min(i, 10) * 40).duration(300)}>
            <Pressable onPress={() => markRead(n)}>
              <GlassCard isInteractive style={[styles.card, !n.read && styles.unread]}>
                <View style={styles.icon}>
                  <Ionicons name={ICONS[n.type] ?? 'notifications-outline'} size={19} color={C.primary} />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.title, !n.read && { fontWeight: '700' }]}>{n.title}</Text>
                  <Text style={styles.msg}>{n.body}</Text>
                  <Text style={styles.time}>{timeAgo(n.at)}</Text>
                </View>
                {!n.read && <View style={styles.dot} />}
              </GlassCard>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 20, paddingBottom: 40, gap: 10, flexGrow: 1 },
  card: {
    flexDirection: 'row', gap: 12, borderRadius: Radii.md,
    padding: 14, alignItems: 'flex-start', minHeight: 72,
  },
  unread: { borderWidth: 1, borderColor: C.primaryLight + '55' },
  icon: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  copy: { flex: 1, gap: 3, minWidth: 0 },
  title: { ...Type.body, fontWeight: '600', color: C.text },
  msg: { ...Type.caption, color: C.textMuted, lineHeight: 18 },
  time: { fontSize: 10, color: C.textLight, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginTop: 6 },
});

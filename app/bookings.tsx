import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/Glass';
import { EmptyState, ScreenHeader } from '../components/ui/ScreenHeader';
import { SkeletonList } from '../components/ui/Skeleton';
import { Radii, Type } from '../constants/theme';
import { API_BASE, api, Booking } from '../lib/api';
import { session } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

const STAGES = ['Enquiry', 'Confirmed', 'In Preparation', 'Completed'] as const;

export default function Bookings() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const user = useSyncExternalStore(session.subscribe, () => session.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clientId = user?.id;
      // Always hit a real filter when signed in; never hardcode offline.
      const path = clientId
        ? `/bookings?clientId=${encodeURIComponent(clientId)}`
        : '/bookings';
      const rows = await api.get<Booking[]>(path);
      setBookings(Array.isArray(rows) ? rows : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Only show the offline copy for genuine network failures
      if (/network|failed to fetch|network request failed|ECONNREFUSED/i.test(msg)) {
        setError(`Can't reach API at ${API_BASE}. Is npm run server running?`);
      } else {
        setError(msg);
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);

  const advance = async (b: Booking) => {
    const next = STAGES[STAGES.indexOf(b.status) + 1];
    if (!next) return;
    try {
      await api.patch(`/bookings/${b.id}/status`, { status: next });
      await api.post('/notifications/booking-status', {
        clientId: b.clientId, decoratorId: b.decoratorId, eventType: b.eventType, status: next,
      }).catch(() => {});
      await load();
    } catch { /* keep list */ }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="My bookings" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading && <SkeletonList count={3} />}

        {!loading && error && (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load bookings"
            body={error}
          />
        )}
        {!loading && error && (
          <Button title="Try again" onPress={load} style={{ borderRadius: 24, marginTop: 8 }} />
        )}

        {!loading && !error && bookings.length === 0 && (
          <EmptyState
            icon="calendar-outline"
            title="No bookings yet"
            body={user
              ? 'Send a decorator a booking request from their profile.'
              : 'Sign in to see bookings tied to your account.'}
          />
        )}

        {!loading && !error && bookings.map((b, i) => (
          <Animated.View key={b.id} entering={FadeInDown.delay(Math.min(i, 8) * 40).duration(350)}>
            <GlassCard style={styles.card}>
              <View style={styles.head}>
                <Text style={styles.name}>{b.decoratorName || 'Decorator'}</Text>
                <View style={styles.statusTag}><Text style={styles.statusText}>{b.status}</Text></View>
              </View>
              <Text style={styles.meta}>{b.eventType} · {b.eventDate || 'date TBC'}</Text>
              {!!b.venue && <Text style={styles.meta}>{b.venue}</Text>}
              {!!b.budget && <Text style={styles.budget}>GH₵{b.budget}</Text>}
              {!!b.brief && <Text numberOfLines={2} style={styles.brief}>{b.brief}</Text>}

              <View style={styles.stepper}>
                {STAGES.map((s, si) => {
                  const done = si <= STAGES.indexOf(b.status);
                  return (
                    <React.Fragment key={s}>
                      {si > 0 && <View style={[styles.line, done && styles.lineDone]} />}
                      <View style={{ alignItems: 'center', width: 62 }}>
                        <View style={[styles.dot, done && styles.dotDone]}>
                          {done && <Ionicons name="checkmark" size={11} color={C.onPrimary} />}
                        </View>
                        <Text style={[styles.stepLabel, done && { color: C.text }]}>{s}</Text>
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {b.status !== 'Completed' && (
                  <Button title="Next stage" variant="ghost" icon="arrow-forward-outline"
                    onPress={() => advance(b)} style={{ flex: 1, height: 44 }} />
                )}
                <Button title="Message" variant="outline" icon="chatbubble-ellipses-outline"
                  onPress={() => router.push({ pathname: '/chat', params: { bookingId: b.id, name: b.decoratorName } })}
                  style={{ flex: 1, height: 44 }} />
              </View>
            </GlassCard>
          </Animated.View>
        ))}

        {!loading && (
          <Pressable onPress={load} style={styles.refresh}>
            <Ionicons name="refresh-outline" size={16} color={C.primary} />
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: { borderRadius: Radii.md, padding: 16, gap: 6 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { ...Type.subtitle, color: C.text },
  statusTag: { backgroundColor: C.accentSoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700', color: C.primary },
  meta: { ...Type.caption, color: C.textMuted },
  budget: { ...Type.price, color: C.text },
  brief: { ...Type.caption, color: C.textMuted, fontStyle: 'italic', lineHeight: 17 },
  stepper: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginVertical: 10 },
  dot: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: C.cardMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  dotDone: { backgroundColor: C.primary },
  line: { flex: 1, height: 2, backgroundColor: C.cardMuted, marginTop: 9, marginHorizontal: -14 },
  lineDone: { backgroundColor: C.primary },
  stepLabel: { fontSize: 9, color: C.textLight, marginTop: 4, textAlign: 'center' },
  refresh: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  refreshText: { ...Type.caption, color: C.primary, fontWeight: '700' },
});

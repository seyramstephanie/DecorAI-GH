import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/ui/BottomNav';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/Glass';
import { EmptyState } from '../components/ui/ScreenHeader';
import { SkeletonList } from '../components/ui/Skeleton';
import { Radii, Type } from '../constants/theme';
import { api, Booking, Decorator } from '../lib/api';
import { session } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

const STAGES = ['Enquiry', 'Confirmed', 'In Preparation', 'Completed'] as const;

// Decorator studio — the home screen for decorator accounts. Matched to the public
// directory by phone number (e.g. sign in as akosua@royaltouch.gh / 1234).
export default function DecoratorDashboard() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const user = session.user;
  const [me, setMe] = useState<Decorator | null>(null);
  const [briefs, setBriefs] = useState<Booking[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Prefer account-linked profile (works for new signups pending or approved).
      let mine: Decorator | null = null;
      if (user?.id) {
        try {
          mine = await api.get<Decorator>(`/me/decorator?userId=${user.id}`);
        } catch {
          const all = await api.get<Decorator[]>('/decorators');
          mine = all.find((d) => d.phone === user?.phone || d.id === user?.decoratorId) ?? null;
        }
      }
      setMe(mine);
      if (mine) setBriefs(await api.get<Booking[]>(`/bookings?decoratorId=${mine.id}`));
      setError(false);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [user?.id, user?.phone, user?.decoratorId]);
  useEffect(() => { load(); }, [load]);

  const advance = async (b: Booking) => {
    const next = STAGES[STAGES.indexOf(b.status) + 1];
    if (!next) return;
    try {
      await api.patch(`/bookings/${b.id}/status`, { status: next });
      await api.post('/notifications/booking-status', {
        clientId: b.clientId, decoratorId: b.decoratorId, eventType: b.eventType, status: next,
      }).catch(() => {});
      load();
    } catch {}
  };
  const calendarBookings = briefs
    .filter((booking) => booking.eventDate && booking.status !== 'Completed')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hello, {user?.name?.split(' ')[0] ?? 'Decorator'}</Text>
          <Text style={styles.sub}>{me ? me.businessName : 'Decorator studio'}</Text>
        </View>
        <View style={styles.headIcon}><Ionicons name="color-palette" size={22} color={C.primary} /></View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error && <EmptyState icon="cloud-offline-outline" title="Backend offline" body="Start it with: npm run server." />}
        {loading && !error && <SkeletonList count={3} />}

        {!loading && !error && !me && (
          <EmptyState icon="color-palette-outline" title="No studio linked"
            body="Sign up as a decorator and complete your profile. Demo: akosua@royaltouch.gh / 1234." />
        )}

        {!loading && me && !me.verified && (
          <GlassCard style={styles.pending}>
            <Ionicons name="time-outline" size={20} color={C.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingTitle}>Profile under review</Text>
              <Text style={styles.pendingBody}>
                Finish your details in Account settings. You go live after admin approval.
              </Text>
            </View>
          </GlassCard>
        )}

        {!loading && me && (
          <>
            <View style={styles.stats}>
              {[
                { label: 'Rating', value: `${me.rating}`, icon: 'star' as const },
                { label: 'Reviews', value: `${me.reviews}`, icon: 'chatbubble-ellipses-outline' as const },
                { label: 'Active', value: `${briefs.filter((b) => b.status !== 'Completed').length}`, icon: 'briefcase-outline' as const },
              ].map((s) => (
                <GlassCard key={s.label} style={styles.stat}>
                  <View style={styles.statIcon}><Ionicons name={s.icon} size={16} color={C.primary} /></View>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </GlassCard>
              ))}
            </View>

            <Text style={styles.section}>Studio calendar</Text>
            <GlassCard style={styles.calendar}>
              {calendarBookings.length ? calendarBookings.map((booking) => (
                <View key={booking.id} style={styles.calendarRow}>
                  <View style={styles.calendarDate}><Ionicons name="calendar" size={16} color={C.primary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.calendarTitle}>{booking.eventType} · {booking.clientName}</Text>
                    <Text style={styles.calendarMeta}>{booking.eventDate}{booking.venue ? ` · ${booking.venue}` : ''}</Text>
                  </View>
                  <View style={styles.calendarStatus}><Text style={styles.calendarStatusText}>{booking.status}</Text></View>
                </View>
              )) : (
                <View style={styles.calendarRow}>
                  <View style={styles.calendarDate}><Ionicons name="calendar-outline" size={16} color={C.primary} /></View>
                  <View style={{ flex: 1 }}><Text style={styles.calendarTitle}>Your diary is open</Text><Text style={styles.calendarMeta}>Confirmed client dates will appear here.</Text></View>
                </View>
              )}
            </GlassCard>

            {/* Portfolio */}
            <Text style={styles.section}>My portfolio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {me.portfolio.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.portfolio} contentFit="cover" transition={250} />
              ))}
            </ScrollView>

            {/* Incoming briefs */}
            <Text style={styles.section}>Incoming briefs</Text>
            {briefs.length === 0 && (
              <EmptyState icon="document-text-outline" title="No briefs yet"
                body="Client booking requests (with their AI designs) appear here." />
            )}
            {briefs.map((b, i) => (
              <Animated.View key={b.id} entering={FadeInDown.delay(i * 60).duration(400)}>
                <GlassCard style={styles.card}>
                  <View style={styles.cardHead}>
                    <Text style={styles.client}>{b.clientName}</Text>
                    <View style={styles.statusTag}><Text style={styles.statusText}>{b.status}</Text></View>
                  </View>
                  <Text style={styles.meta}>{b.eventType} · {b.eventDate || 'date TBC'}{b.venue ? ` · ${b.venue}` : ''}</Text>
                  {!!b.budget && <Text style={styles.budget}>GH₵{b.budget}</Text>}
                  {!!b.brief && <Text numberOfLines={3} style={styles.brief}>{b.brief}</Text>}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    {b.status !== 'Completed' && (
                      <Button title={`Mark ${STAGES[STAGES.indexOf(b.status) + 1]}`} variant="ghost"
                        icon="arrow-forward-outline" onPress={() => advance(b)} style={{ flex: 1, height: 44 }} />
                    )}
                    <Button title="Message" variant="outline" icon="chatbubble-ellipses-outline"
                      onPress={() => router.push({ pathname: '/chat', params: { bookingId: b.id, name: b.clientName } })}
                      style={{ flex: 1, height: 44 }} />
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </>
        )}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16,
  },
  hello: { ...Type.hero, color: C.text },
  sub: { ...Type.caption, color: C.textMuted, marginTop: 2 },
  headIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  pending: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    borderRadius: Radii.md, padding: 14, marginBottom: 12,
  },
  pendingTitle: { ...Type.subtitle, color: C.text, fontSize: 14 },
  pendingBody: { ...Type.caption, color: C.textMuted, marginTop: 4, lineHeight: 16 },
  body: { paddingHorizontal: 20, paddingBottom: 24 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  stat: { flex: 1, borderRadius: Radii.md, padding: 12, gap: 4 },
  statIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  statValue: { ...Type.title, color: C.primary, fontSize: 18 },
  statLabel: { ...Type.caption, color: C.textMuted },
  calendar: { borderRadius: Radii.md, padding: 4 },
  calendarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  calendarDate: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  calendarTitle: { ...Type.caption, color: C.text, fontWeight: '700' },
  calendarMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  calendarStatus: { backgroundColor: C.accentSoft, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 },
  calendarStatusText: { fontSize: 9, fontWeight: '700', color: C.primary },
  section: { ...Type.subtitle, color: C.text, marginTop: 20, marginBottom: 10 },
  portfolio: { width: 200, height: 130, borderRadius: Radii.md, backgroundColor: C.cardMuted },
  card: { borderRadius: Radii.md, padding: 16, gap: 6, marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  client: { ...Type.subtitle, color: C.text },
  statusTag: { backgroundColor: C.accentSoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700', color: C.primary },
  meta: { ...Type.caption, color: C.textMuted },
  budget: { ...Type.price, color: C.text },
  brief: { ...Type.caption, color: C.textMuted, fontStyle: 'italic', lineHeight: 17 },
});

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/ui/BottomNav';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/Glass';
import { EmptyState } from '../components/ui/ScreenHeader';
import { SkeletonList } from '../components/ui/Skeleton';
import { Radii, Type } from '../constants/theme';
import { api, Decorator } from '../lib/api';
import { session } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');

export default function Admin() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const user = session.user;
  const [pending, setPending] = useState<Decorator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      setPending(await api.get<Decorator[]>(`/admin/decorators/pending?adminId=${user.id}`));
      setError(false);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) return <Redirect href="/create-account" />;
  if (user.role !== 'admin') return <Redirect href="/home" />;

  const approve = async (id: string) => {
    setBusyId(id);
    try {
      await api.post(`/admin/decorators/${id}/approve`, { adminId: user.id });
      await load();
    } catch {
      Alert.alert('Failed', 'Could not approve decorator.');
    } finally { setBusyId(null); }
  };

  const reject = async (id: string) => {
    setBusyId(id);
    try {
      await api.post(`/admin/decorators/${id}/reject`, {
        adminId: user.id,
        reason: 'Please update your bio, portfolio, and contact details, then re-apply.',
      });
      await load();
    } catch {
      Alert.alert('Failed', 'Could not reject decorator.');
    } finally { setBusyId(null); }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hello, {user.name?.split(' ')[0] ?? 'Admin'}</Text>
          <Text style={styles.sub}>Review decorator applications</Text>
        </View>
        <View style={styles.headIcon}>
          <Ionicons name="clipboard" size={22} color={C.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error && (
          <EmptyState icon="cloud-offline-outline" title="Backend offline" body="Start it with: npm run server." />
        )}

        {!error && (
          <View style={styles.stats}>
            <GlassCard style={styles.stat}>
              <View style={styles.statIcon}><Ionicons name="hourglass-outline" size={18} color={C.primary} /></View>
              <Text style={styles.statValue}>{loading ? '…' : pending.length}</Text>
              <Text style={styles.statLabel}>Awaiting review</Text>
            </GlassCard>
            <GlassCard style={styles.stat}>
              <View style={styles.statIcon}><Ionicons name="people-outline" size={18} color={C.primary} /></View>
              <Text style={styles.statValue}>{loading ? '…' : pending.length ? 'Review' : 'Idle'}</Text>
              <Text style={styles.statLabel}>Queue status</Text>
            </GlassCard>
          </View>
        )}

        <Text style={styles.section}>Applications</Text>

        {loading && !error && <SkeletonList count={3} />}

        {!loading && !error && pending.length === 0 && (
          <EmptyState
            icon="checkmark-circle-outline"
            title="Inbox empty"
            body="No decorators waiting for approval. New signups appear here."
          />
        )}

        {!loading && pending.map((d, i) => (
          <Animated.View key={d.id} entering={FadeInDown.delay(i * 60).duration(400)}>
            <GlassCard style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(d.name || d.businessName)}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.name}>{d.businessName}</Text>
                    <View style={styles.statusTag}>
                      <Text style={styles.statusText}>New</Text>
                    </View>
                  </View>
                  <Text style={styles.meta}>{d.name}</Text>
                  <View style={styles.row}>
                    <Ionicons name="location-outline" size={13} color={C.textMuted} />
                    <Text style={styles.meta}>{d.location}</Text>
                    {!!d.phone && (
                      <>
                        <Ionicons name="call-outline" size={13} color={C.textMuted} style={{ marginLeft: 8 }} />
                        <Text style={styles.meta}>{d.phone}</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {!!d.bio && <Text numberOfLines={3} style={styles.brief}>{d.bio}</Text>}
              {!!d.priceRange && <Text style={styles.price}>{d.priceRange}</Text>}

              <View style={styles.chips}>
                {(d.specialisations || []).map((s) => (
                  <View key={s} style={styles.chip}>
                    <Text style={styles.chipText}>{s}</Text>
                  </View>
                ))}
              </View>

              {(d.portfolio || []).length > 0 && (
                <View style={styles.thumbs}>
                  {d.portfolio.slice(0, 3).map((uri) => (
                    <Image key={uri} source={{ uri }} style={styles.thumb} contentFit="cover" transition={200} />
                  ))}
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <Button
                  title="Approve"
                  icon="checkmark-circle-outline"
                  loading={busyId === d.id}
                  onPress={() => approve(d.id)}
                  style={{ flex: 1, height: 44 }}
                />
                <Button
                  title="Reject"
                  variant="outline"
                  icon="close-circle-outline"
                  loading={busyId === d.id}
                  onPress={() => reject(d.id)}
                  style={{ flex: 1, height: 44 }}
                />
              </View>
            </GlassCard>
          </Animated.View>
        ))}
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
  body: { paddingHorizontal: 20, paddingBottom: 24 },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  stat: {
    flex: 1, borderRadius: Radii.md, padding: 14, gap: 6,
  },
  statIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  statValue: { ...Type.title, color: C.primary, fontSize: 20 },
  statLabel: { ...Type.caption, color: C.textMuted },
  section: { ...Type.subtitle, color: C.text, marginTop: 18, marginBottom: 10 },
  card: { borderRadius: Radii.md, padding: 16, gap: 8, marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Type.subtitle, color: C.primary },
  name: { ...Type.subtitle, color: C.text, flexShrink: 1 },
  meta: { ...Type.caption, color: C.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  statusTag: { backgroundColor: C.accentSoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700', color: C.primary },
  brief: { ...Type.caption, color: C.textMuted, fontStyle: 'italic', lineHeight: 17 },
  price: { ...Type.caption, color: C.primary, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: C.cardMuted, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  chipText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  thumbs: { flexDirection: 'row', gap: 6, marginTop: 2 },
  thumb: { width: 72, height: 52, borderRadius: 8, backgroundColor: C.cardMuted },
});

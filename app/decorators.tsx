import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavSpacer } from '../components/ui/BottomNav';
import { Pill } from '../components/ui/Chip';
import { EmptyState, ScreenHeader } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { Palette, useColors } from '../lib/theme';
import { api, Decorator } from '../lib/api';

const FILTERS = ['All', 'Wedding', 'Funeral', 'Birthday', 'Corporate', 'Home Interior'];

const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');

export default function Decorators() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const [decorators, setDecorators] = useState<Decorator[]>([]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<Decorator[]>('/decorators').then(setDecorators).catch(() => setError(true));
  }, []);

  const rows = filter === 'All'
    ? decorators
    : decorators.filter((d) => d.specialisations.some((s) => s.toLowerCase().includes(filter.toLowerCase())));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Decorators" />

      {designId && (
        <View style={styles.banner}>
          <Ionicons name="image-outline" size={16} color={C.primary} />
          <Text style={styles.bannerText}>Sharing your AI design as the brief — pick a decorator</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => <Pill key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />)}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error && <EmptyState icon="cloud-offline-outline" title="Backend offline" body="Start it with: npm run server." />}
        {!error && rows.length === 0 && (
          <EmptyState icon="people-outline" title="No decorators" body="No verified decorators match this filter yet." />
        )}
        {rows.map((d, i) => (
          <Animated.View key={d.id} entering={FadeInDown.delay(i * 60).duration(400)}>
            <Pressable
              style={[styles.card, Shadow.card]}
              onPress={() => router.push({ pathname: '/decorator-detail', params: { id: d.id, ...(designId ? { designId } : {}) } })}
            >
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials(d.name)}</Text></View>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.name}>{d.businessName}</Text>
                  {d.verified && <Ionicons name="checkmark-circle" size={16} color={C.success} />}
                </View>
                <Text style={styles.meta}>{d.name}</Text>
                <View style={styles.row}>
                  <Ionicons name="location-outline" size={13} color={C.textMuted} />
                  <Text style={styles.meta}>{d.location}</Text>
                  <Ionicons name="star" size={13} color={C.accent} style={{ marginLeft: 8 }} />
                  <Text style={styles.metaDark}>{d.rating} ({d.reviews})</Text>
                </View>
                <View style={styles.chips}>
                  {d.specialisations.map((s) => (
                    <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
                  ))}
                </View>
                <Text style={styles.price}>{d.priceRange}</Text>
                {/* Portfolio peek — a taste of their real work right on the card */}
                <View style={styles.thumbs}>
                  {d.portfolio.slice(0, 3).map((uri) => (
                    <Image key={uri} source={{ uri }} style={styles.thumb} contentFit="cover" transition={200} />
                  ))}
                </View>
              </View>
              <View style={{ alignItems: 'center', gap: 14 }}>
                <Pressable
                  hitSlop={8}
                  onPress={() => router.push({ pathname: '/place-map', params: { id: d.id, type: 'decorator' } })}
                  style={styles.mapBtn}
                >
                  <Ionicons name="location" size={16} color={C.primary} />
                </Pressable>
                <Ionicons name="chevron-forward" size={18} color={C.textLight} />
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
      <BottomNavSpacer />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.accentSoft,
    borderRadius: Radii.sm, padding: 12, marginHorizontal: 20, marginBottom: 12,
  },
  bannerText: { ...Type.caption, color: C.primary, flex: 1 },
  filters: { gap: 8, paddingHorizontal: 20, paddingBottom: 14 },
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: {
    flexDirection: 'row', gap: 14, backgroundColor: C.card, borderRadius: Radii.md,
    padding: 16, alignItems: 'center',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Type.subtitle, color: C.primary },
  name: { ...Type.subtitle, color: C.text },
  meta: { ...Type.caption, color: C.textMuted },
  metaDark: { ...Type.caption, color: C.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 3 },
  chip: { backgroundColor: C.cardMuted, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  chipText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  price: { ...Type.caption, color: C.primary, fontWeight: '700', marginTop: 3 },
  thumbs: { flexDirection: 'row', gap: 6, marginTop: 8 },
  thumb: { width: 56, height: 42, borderRadius: 8, backgroundColor: C.cardMuted },
  mapBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
});

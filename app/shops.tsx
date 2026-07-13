import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/ui/BottomNav';
import { EmptyState } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { api, Shop } from '../lib/api';
import { Palette, useColors } from '../lib/theme';

type OnlineSource = { item: string; sources: { vendor: string; url: string; delivery: string }[]; guidance: string };
type MatchedShop = Shop & { matchedItems?: string[] };

export default function Shops() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; items?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [shops, setShops] = useState<MatchedShop[]>([]);
  const [online, setOnline] = useState<OnlineSource[]>([]);
  const [alerted, setAlerted] = useState(0);
  const [error, setError] = useState(false);
  const items: string[] = params.items ? JSON.parse(params.items) : [];

  const load = async (q: string) => {
    setError(false);
    try {
      if (items.length) {
        // FR-15/16/26 — composite sourcing flow through the gateway
        const res = await api.post<{ matches: MatchedShop[]; online: OnlineSource[]; alertedShops: number }>(
          '/sourcing/items', { items, area: 'Kumasi' });
        setShops(res.matches); setOnline(res.online); setAlerted(res.alertedShops);
      } else {
        setShops(await api.get<MatchedShop[]>(`/shops${q ? `?q=${encodeURIComponent(q)}` : ''}`));
      }
    } catch { setError(true); }
  };

  useEffect(() => { load(query); }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Decor shops</Text>

      {!items.length && (
        <View style={[styles.search, Shadow.card]}>
          <Ionicons name="search" size={18} color={C.textLight} />
          <TextInput
            style={styles.searchInput} value={query} onChangeText={setQuery}
            placeholder="Search shops or items…" placeholderTextColor={C.textLight}
            onSubmitEditing={() => load(query)} returnKeyType="search"
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {alerted > 0 && (
          <View style={styles.banner}>
            <Ionicons name="megaphone-outline" size={16} color={C.primary} />
            <Text style={styles.bannerText}>{alerted} nearby shop{alerted > 1 ? 's were' : ' was'} alerted about your search</Text>
          </View>
        )}

        {error && <EmptyState icon="cloud-offline-outline" title="Backend offline"
          body="Start it with: npm run server — then pull to refresh." />}
        {!error && shops.length === 0 && (
          <EmptyState icon="storefront-outline" title="No shops found" body="Try a different search term." />
        )}

        {shops.map((s, i) => (
          <Animated.View key={s.id} entering={FadeInDown.delay(i * 60).duration(400)}>
            <View style={[styles.card, Shadow.card]}>
              {!!s.image && (
                <View style={styles.photoWrap}>
                  <Image source={{ uri: s.image }} style={styles.photo} contentFit="cover" transition={250} />
                  <Pressable
                    style={styles.photoPin}
                    onPress={() => router.push({ pathname: '/place-map', params: { id: s.id, type: 'shop' } })}
                  >
                    <Ionicons name="location" size={14} color={C.white} />
                    <Text style={styles.photoPinText} numberOfLines={1}>{s.distanceKm} km</Text>
                  </Pressable>
                </View>
              )}
              <View style={styles.cardHead}>
                <Text style={styles.shopName}>{s.name}</Text>
                {s.verified && <Ionicons name="checkmark-circle" size={17} color={C.success} />}
              </View>
              <Text style={styles.meta}>{s.category} · {s.area}, {s.location}</Text>
              <View style={styles.row}>
                <Ionicons name="star" size={14} color={C.accent} />
                <Text style={styles.metaDark}>{s.rating} ({s.reviews})</Text>
                <Ionicons name="call-outline" size={14} color={C.textMuted} style={{ marginLeft: 10 }} />
                <Text style={styles.metaDark}>{s.phone}</Text>
              </View>
              <Pressable
                style={styles.locationRow}
                onPress={() => router.push({ pathname: '/place-map', params: { id: s.id, type: 'shop' } })}
              >
                <Ionicons name="navigate-outline" size={14} color={C.primary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {s.distanceKm} km away · View location & directions
                </Text>
                <Ionicons name="chevron-forward" size={14} color={C.primary} />
              </Pressable>
              <View style={styles.chips}>
                {(s.matchedItems?.length ? s.matchedItems : s.stock.slice(0, 4)).map((item) => (
                  <View key={item} style={[styles.chip, s.matchedItems?.length ? styles.chipMatch : null]}>
                    <Text style={[styles.chipText, s.matchedItems?.length ? { color: C.primary } : null]}>{item}</Text>
                  </View>
                ))}
                {!s.matchedItems?.length && s.stock.length > 4 && (
                  <View style={styles.chip}><Text style={styles.chipText}>+{s.stock.length - 4}</Text></View>
                )}
              </View>
            </View>
          </Animated.View>
        ))}

        {online.length > 0 && (
          <>
            <Text style={styles.section}>Online alternatives</Text>
            {online.map((o) => (
              <View key={o.item} style={[styles.card, Shadow.card]}>
                <Text style={styles.shopName}>{o.item}</Text>
                {o.sources.map((src) => (
                  <View key={src.vendor} style={styles.row}>
                    <Ionicons name="globe-outline" size={14} color={C.textMuted} />
                    <Text style={styles.metaDark}>{src.vendor}</Text>
                    <Text style={styles.meta}> · {src.delivery}</Text>
                  </View>
                ))}
                <Text style={styles.guidance}>{o.guidance}</Text>
              </View>
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
  title: { ...Type.hero, color: C.text, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card,
    borderRadius: Radii.md, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14, height: 48,
  },
  searchInput: { flex: 1, ...Type.body, color: C.text },
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.accentSoft,
    borderRadius: Radii.sm, padding: 12,
  },
  bannerText: { ...Type.caption, color: C.primary, flex: 1 },
  card: { backgroundColor: C.card, borderRadius: Radii.md, padding: 16, gap: 6 },
  photoWrap: { marginHorizontal: -16, marginTop: -16, marginBottom: 8 },
  photo: { height: 130, borderTopLeftRadius: Radii.md, borderTopRightRadius: Radii.md },
  photoPin: {
    position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.overlay, borderRadius: 14, paddingHorizontal: 10, height: 28,
  },
  photoPinText: { color: C.white, fontSize: 11, fontWeight: '700' },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accentSoft,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, marginTop: 4,
  },
  locationText: { fontSize: 12, fontWeight: '600', color: C.primary, flex: 1 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shopName: { ...Type.subtitle, color: C.text },
  meta: { ...Type.caption, color: C.textMuted },
  metaDark: { ...Type.caption, color: C.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: { backgroundColor: C.cardMuted, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  chipMatch: { backgroundColor: C.accentSoft },
  chipText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  section: { ...Type.subtitle, color: C.text, marginTop: 10 },
  guidance: { ...Type.caption, color: C.textMuted, marginTop: 6, lineHeight: 17, fontStyle: 'italic' },
});

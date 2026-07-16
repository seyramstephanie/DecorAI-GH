import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/ui/BottomNav';
import { Glass, GlassCard, GlassPill } from '../components/ui/Glass';
import { EmptyState } from '../components/ui/ScreenHeader';
import { SkeletonList } from '../components/ui/Skeleton';
import { Radii, Type } from '../constants/theme';
import { api, Shop } from '../lib/api';
import { Palette, useColors } from '../lib/theme';

type OnlineSource = { item: string; sources: { vendor: string; url: string; delivery: string }[]; guidance: string };
type MatchedShop = Shop & { matchedItems?: string[] };
const SHOP_FILTERS = ['All', 'Furniture', 'Florist', 'Fabric Supplier', 'Lighting Rental', 'Event Rentals', 'Handicrafts'];

/** Fixed height for the filter strip so skeletons never collide with it. */
const FILTER_BAR_H = 48;

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
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const items = useMemo<string[]>(() => (params.items ? JSON.parse(params.items) : []), [params.items]);

  const load = useCallback(async (q: string) => {
    setError(false);
    // Skeleton only before the first successful payload — chrome (filters) stays put
    if (!hasLoadedOnce.current) setLoading(true);
    try {
      if (items.length) {
        const res = await api.post<{ matches: MatchedShop[]; online: OnlineSource[]; alertedShops: number }>(
          '/sourcing/items',
          { items, area: 'Kumasi' },
        );
        setShops(res.matches);
        setOnline(res.online);
        setAlerted(res.alertedShops);
      } else {
        setShops(await api.get<MatchedShop[]>(`/shops${q ? `?q=${encodeURIComponent(q)}` : ''}`));
        setOnline([]);
        setAlerted(0);
      }
      hasLoadedOnce.current = true;
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [items]);

  useEffect(() => {
    void load(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial + items only; search uses submit
  }, [items, load]);

  // When query param from home product deep-link arrives
  useEffect(() => {
    if (params.q != null && params.q !== '') {
      setQuery(params.q);
      void load(params.q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  const visibleShops = filter === 'All' ? shops : shops.filter((shop) => shop.category === filter);
  // Skeletons only in the list region — never replace/overlap the fixed chrome
  const showSkeleton = loading && shops.length === 0 && !error;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* ── Fixed chrome (does not scroll with the list / skeleton) ── */}
      <View style={styles.chrome}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Decor shops</Text>
            <Text style={styles.subtitle}>Curated local suppliers for every detail</Text>
          </View>
          <Pressable onPress={() => router.push('/place-map' as any)}>
            <Glass isInteractive glassEffectStyle="clear" style={styles.mapShortcut}>
              <Ionicons name="map-outline" size={19} color={C.primary} />
            </Glass>
          </Pressable>
        </View>

        {!items.length && (
          <>
            <Glass style={styles.search}>
              <Ionicons name="search" size={18} color={C.textLight} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search shops or items…"
                placeholderTextColor={C.textLight}
                onSubmitEditing={() => load(query)}
                returnKeyType="search"
              />
              {!!query && (
                <Pressable
                  onPress={() => {
                    setQuery('');
                    void load('');
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={18} color={C.textLight} />
                </Pressable>
              )}
            </Glass>

            {/*
              Static filter strip: fixed height, solid bg, high zIndex.
              Horizontal scroll only for overflow chips — bar itself never moves vertically.
            */}
            <View style={styles.filterBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.filters}
                style={styles.filterScroll}
              >
                {SHOP_FILTERS.map((entry) => (
                  <View key={entry} style={styles.filterItem}>
                    <GlassPill
                      label={entry}
                      active={filter === entry}
                      onPress={() => setFilter(entry)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </View>

      {/* ── Scrollable list only ── */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {alerted > 0 && (
          <View style={styles.banner}>
            <Ionicons name="megaphone-outline" size={16} color={C.primary} />
            <Text style={styles.bannerText}>
              {alerted} nearby shop{alerted > 1 ? 's were' : ' was'} alerted about your search
            </Text>
          </View>
        )}

        {error && (
          <EmptyState
            icon="cloud-offline-outline"
            title="Backend offline"
            body="Start it with: npm run server — then pull to refresh."
          />
        )}

        {showSkeleton && (
          <View style={styles.skeletonWrap}>
            <SkeletonList count={4} />
          </View>
        )}

        {!showSkeleton && !error && visibleShops.length === 0 && (
          <EmptyState icon="storefront-outline" title="No shops found" body="Try a different search term or filter." />
        )}

        {!showSkeleton &&
          visibleShops.map((s, i) => (
            <Animated.View key={s.id} entering={FadeInDown.delay(Math.min(i, 8) * 40).duration(350)}>
              <GlassCard style={styles.card}>
                {!!s.image && (
                  <View style={styles.photoWrap}>
                    <Image source={{ uri: s.image }} style={styles.photo} contentFit="cover" transition={250} />
                    <Pressable
                      style={styles.photoPin}
                      onPress={() => router.push({ pathname: '/place-map', params: { id: s.id, type: 'shop' } })}
                    >
                      <Ionicons name="location" size={14} color={C.white} />
                      <Text style={styles.photoPinText} numberOfLines={1}>
                        {s.distanceKm} km
                      </Text>
                    </Pressable>
                  </View>
                )}
                <View style={styles.cardBody}>
                  <View style={styles.cardHead}>
                    <Text style={styles.shopName}>{s.name}</Text>
                    {s.verified && <Ionicons name="checkmark-circle" size={17} color={C.success} />}
                  </View>
                  <Text style={styles.meta}>
                    {s.category} · {s.area}, {s.location}
                  </Text>
                  <View style={styles.row}>
                    <Ionicons name="star" size={14} color={C.accent} />
                    <Text style={styles.metaDark}>
                      {s.rating} ({s.reviews})
                    </Text>
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
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chips}
                  >
                    {(s.matchedItems?.length ? s.matchedItems : s.stock.slice(0, 4)).map((item) => (
                      <View key={item} style={[styles.chip, s.matchedItems?.length ? styles.chipMatch : null]}>
                        <Text style={[styles.chipText, s.matchedItems?.length ? { color: C.primary } : null]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                    {!s.matchedItems?.length && s.stock.length > 4 && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>+{s.stock.length - 4}</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </GlassCard>
            </Animated.View>
          ))}

        {!showSkeleton && online.length > 0 && (
          <>
            <Text style={styles.section}>Online alternatives</Text>
            {online.map((o) => (
              <GlassCard key={o.item} style={[styles.card, { padding: 16, gap: 6 }]}>
                <Text style={styles.shopName}>{o.item}</Text>
                {o.sources.map((src) => (
                  <View key={src.vendor} style={styles.row}>
                    <Ionicons name="globe-outline" size={14} color={C.textMuted} />
                    <Text style={styles.metaDark}>{src.vendor}</Text>
                    <Text style={styles.meta}> · {src.delivery}</Text>
                  </View>
                ))}
                <Text style={styles.guidance}>{o.guidance}</Text>
              </GlassCard>
            ))}
          </>
        )}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    // Fixed header block — solid bg so list/skeletons never paint underneath
    chrome: {
      backgroundColor: C.bg,
      zIndex: 10,
      elevation: 4,
      paddingBottom: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 12,
      gap: 12,
    },
    title: { ...Type.hero, color: C.text },
    subtitle: { ...Type.caption, color: C.textMuted, marginTop: 2 },
    mapShortcut: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: Radii.md,
      marginHorizontal: 20,
      marginBottom: 10,
      paddingHorizontal: 14,
      height: 48,
      overflow: 'hidden',
    },
    searchInput: { flex: 1, ...Type.body, color: C.text },
    filterBar: {
      height: FILTER_BAR_H,
      backgroundColor: C.bg,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    filterScroll: {
      flexGrow: 0,
      height: FILTER_BAR_H,
    },
    filters: {
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      height: FILTER_BAR_H,
      paddingVertical: 6,
    },
    filterItem: {
      height: 36,
      justifyContent: 'center',
    },
    list: { flex: 1 },
    body: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, gap: 12 },
    skeletonWrap: {
      // Keep skeleton fully inside list bounds — no negative margins / overlays
      marginTop: 0,
      minHeight: 200,
    },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: C.accentSoft,
      borderRadius: Radii.sm,
      padding: 12,
    },
    bannerText: { ...Type.caption, color: C.primary, flex: 1 },
    card: { borderRadius: Radii.md, overflow: 'hidden' },
    photoWrap: { width: '100%' },
    photo: { height: 130, width: '100%' },
    cardBody: { padding: 16, gap: 6 },
    photoPin: {
      position: 'absolute',
      right: 10,
      bottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: C.overlay,
      borderRadius: 14,
      paddingHorizontal: 10,
      height: 28,
    },
    photoPinText: { color: C.white, fontSize: 11, fontWeight: '700' },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.accentSoft,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginTop: 4,
    },
    locationText: { fontSize: 12, fontWeight: '600', color: C.primary, flex: 1 },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    shopName: { ...Type.subtitle, color: C.text },
    meta: { ...Type.caption, color: C.textMuted },
    metaDark: { ...Type.caption, color: C.text },
    row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    chips: { flexDirection: 'row', gap: 6, marginTop: 4, paddingRight: 4 },
    chip: { backgroundColor: C.cardMuted, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    chipMatch: { backgroundColor: C.accentSoft },
    chipText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
    section: { ...Type.subtitle, color: C.text, marginTop: 10 },
    guidance: { ...Type.caption, color: C.textMuted, marginTop: 6, lineHeight: 17, fontStyle: 'italic' },
  });

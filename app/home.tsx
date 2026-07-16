import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AiBubble } from '../components/ui/AiBubble';
import { BottomNav } from '../components/ui/BottomNav';
import { CategoryChip } from '../components/ui/Chip';
import { Glass } from '../components/ui/Glass';
import { ProductCard } from '../components/ui/ProductCard';
import { Type } from '../constants/theme';
import { CATEGORIES, PRODUCTS, type Product } from '../data/seed';
import { api, Notification } from '../lib/api';
import { session } from '../lib/session';
import { actions, useStore } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

const CHIP_ICONS = { Popular: 'star', Sofa: 'sofa-outline', Chair: 'chair-rolling', Table: 'table-furniture', Bed: 'bed-outline' } as const;

const SPACES = [
  { event: 'Home Interior', label: 'Home', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80' },
  { event: 'Wedding', label: 'Weddings', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80' },
  { event: 'Funeral', label: 'Funerals', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&q=80' },
  { event: 'Birthday', label: 'Birthdays', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80' },
  { event: 'Church Anniversary', label: 'Church', image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&q=80' },
  { event: 'Corporate', label: 'Corporate', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&q=80' },
];

/** Pair products into rows for a 2-column grid inside a single vertical FlatList. */
function toRows(list: Product[]): Product[][] {
  const rows: Product[][] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
  return rows;
}

export default function Home() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const { favourites } = useStore();
  const [category, setCategory] = useState<string>('Popular');
  const [unread, setUnread] = useState(0);
  const role = session.user?.role;

  useEffect(() => {
    if (role && role !== 'client') return;
    api.get<Notification[]>(`/notifications?userId=${session.user?.id ?? 'guest'}`)
      .then((rows) => setUnread(rows.filter((n) => !n.read).length))
      .catch(() => setUnread(0));
  }, [role]);

  // Popular = flagged Popular items + highlights (includes bed so it isn't buried/missing).
  // Other chips filter strictly by category so "Bed" always includes Rattan King Bed Frame.
  const products = useMemo(() => {
    if (category === 'Popular') {
      const popular = PRODUCTS.filter((p) => p.category === 'Popular');
      const highlights = PRODUCTS.filter((p) => ['Sofa', 'Bed', 'Chair'].includes(p.category));
      const seen = new Set<string>();
      const merged: Product[] = [];
      for (const p of [...popular, ...highlights, ...PRODUCTS]) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        merged.push(p);
      }
      return merged;
    }
    return PRODUCTS.filter((p) => p.category === category);
  }, [category]);

  const rows = useMemo(() => toRows(products), [products]);

  if (role === 'decorator') return <Redirect href="/decorator-dashboard" />;
  if (role === 'shop') return <Redirect href="/shop-dashboard" />;
  if (role === 'admin') return <Redirect href={'/admin' as any} />;

  const header = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Decorate Any Space</Text>
        <Pressable onPress={() => router.push('/notification')} style={styles.bell} hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={C.text} />
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Design spaces</Text>
      <FlatList
        data={SPACES}
        keyExtractor={(s) => s.event}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spacesRail}
        style={{ flexGrow: 0 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.spaceCard}
            onPress={() => router.push(
              session.canUseAi()
                ? { pathname: '/generate', params: { eventType: item.event } }
                : ('/pro' as any),
            )}
          >
            <Image source={{ uri: item.image }} style={styles.spaceImg} contentFit="cover" transition={200} />
            <View style={styles.spaceOverlay} />
            <Text style={styles.spaceLabel} numberOfLines={1}>{item.label}</Text>
          </Pressable>
        )}
      />

      <Pressable onPress={() => router.push('/decorators')}>
        <Glass isInteractive glassEffectStyle="regular" style={styles.decoratorsRow}>
          <View style={styles.decoratorsIcon}><Ionicons name="people" size={18} color={C.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.decoratorsTitle}>Find decorators near you</Text>
            <Text style={styles.decoratorsSub} numberOfLines={1}>Verified pros for weddings, funerals & more</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.textLight} />
        </Glass>
      </Pressable>

      <Text style={styles.sectionTitle}>Shop the look</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c}
            label={c}
            icon={CHIP_ICONS[c]}
            active={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* One vertical list so every product (including Rattan King Bed Frame) is reachable by scroll */}
      <FlatList
        data={rows}
        keyExtractor={(row) => row.map((p) => p.id).join('-')}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: row, index }) => (
          <View style={styles.productRow}>
            {row.map((item, col) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay((index * 2 + col) * 40).duration(350)}
                style={styles.productCell}
              >
                <ProductCard
                  product={item}
                  liked={favourites.includes(item.id)}
                  onToggleLike={() => actions.toggleFavourite(item.id)}
                  onPress={() => router.push({
                    pathname: '/shops',
                    // Search by a meaningful term (e.g. "Bed" / "Rattan") not only the last word
                    params: { q: item.name.split(' ').slice(0, 2).join(' ') },
                  })}
                />
              </Animated.View>
            ))}
            {/* Keep 2-column alignment when a row has a single item */}
            {row.length === 1 && <View style={styles.productCell} />}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No items in this category yet.</Text>
        }
      />
      <AiBubble onPress={() => router.push('/generate')} />
      <BottomNav />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  list: { paddingBottom: 28 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18,
  },
  title: { ...Type.hero, color: C.text },
  bell: { padding: 2 },
  badge: {
    position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, borderRadius: 9,
    backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: C.onPrimary, fontSize: 10, fontWeight: '700' },
  chips: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  sectionTitle: { ...Type.subtitle, color: C.text, paddingHorizontal: 20, marginBottom: 10 },
  decoratorsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 12, marginHorizontal: 20, marginBottom: 18, overflow: 'hidden',
  },
  decoratorsIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  decoratorsTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  decoratorsSub: { ...Type.caption, color: C.textMuted, marginTop: 1 },
  spacesRail: { paddingHorizontal: 20, gap: 12, paddingBottom: 18 },
  spaceCard: { width: 128, height: 92, borderRadius: 16, overflow: 'hidden', backgroundColor: C.cardMuted },
  spaceImg: { ...StyleSheet.absoluteFillObject },
  spaceOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31,26,22,0.30)' },
  spaceLabel: {
    position: 'absolute', bottom: 8, left: 10, right: 10,
    color: C.white, fontSize: 13, fontWeight: '700',
  },
  productRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  productCell: { flex: 1 },
  empty: { ...Type.body, color: C.textMuted, textAlign: 'center', padding: 24 },
});

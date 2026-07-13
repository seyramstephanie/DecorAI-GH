import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AiBubble } from '../components/ui/AiBubble';
import { BottomNav } from '../components/ui/BottomNav';
import { CategoryChip } from '../components/ui/Chip';
import { ProductCard } from '../components/ui/ProductCard';
import { Shadow, Type } from '../constants/theme';
import { CATEGORIES, PRODUCTS } from '../data/seed';
import { session } from '../lib/session';
import { actions, useStore } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

const CHIP_ICONS = { Popular: 'star', Sofa: 'sofa-outline', Chair: 'chair-rolling', Table: 'table-furniture', Bed: 'bed-outline' } as const;

// Design spaces — the app decorates every kind of space, not just homes.
// Tapping one opens the AI generator with that event type preselected.
const SPACES = [
  { event: 'Home Interior', label: 'Home', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80' },
  { event: 'Wedding', label: 'Weddings', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80' },
  { event: 'Funeral', label: 'Funerals', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&q=80' },
  { event: 'Birthday', label: 'Birthdays', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80' },
  { event: 'Church Anniversary', label: 'Church', image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&q=80' },
  { event: 'Corporate', label: 'Corporate', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&q=80' },
];

export default function Home() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const { favourites } = useStore();
  const [category, setCategory] = useState<string>('Popular');
  // Decorators and shop owners get their own home screens
  const role = session.user?.role;
  if (role === 'decorator') return <Redirect href="/decorator-dashboard" />;
  if (role === 'shop') return <Redirect href="/shop-dashboard" />;

  const products = category === 'Popular'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === category);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header — per UI reference */}
      <View style={styles.header}>
        <Text style={styles.title}>Decorate Any Space</Text>
        <Pressable onPress={() => router.push('/notification')} style={styles.bell} hitSlop={8}>
          <Ionicons name="notifications-outline" size={24} color={C.text} />
          <View style={styles.badge}><Text style={styles.badgeText}>5</Text></View>
        </Pressable>
      </View>

      {/* Design spaces — homes, weddings, funerals, birthdays, church, corporate */}
      <Text style={styles.sectionTitle}>Design spaces</Text>
      <FlatList
        data={SPACES}
        keyExtractor={(s) => s.event}
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.spacesRail}
        style={{ flexGrow: 0 }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.spaceCard, Shadow.card]}
            onPress={() => router.push({ pathname: '/generate', params: { eventType: item.event } })}
          >
            <Image source={{ uri: item.image }} style={styles.spaceImg} contentFit="cover" transition={200} />
            <View style={styles.spaceOverlay} />
            <Text style={styles.spaceLabel} numberOfLines={1}>{item.label}</Text>
          </Pressable>
        )}
      />

      {/* Decorators entry point */}
      <Pressable style={[styles.decoratorsRow, Shadow.card]} onPress={() => router.push('/decorators')}>
        <View style={styles.decoratorsIcon}><Ionicons name="people" size={18} color={C.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.decoratorsTitle}>Find decorators near you</Text>
          <Text style={styles.decoratorsSub} numberOfLines={1}>Verified pros for weddings, funerals & more</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.textLight} />
      </Pressable>

      {/* Category chips */}
      <Text style={styles.sectionTitle}>Shop the look</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c} label={c} icon={CHIP_ICONS[c]}
            active={category === c} onPress={() => setCategory(c)}
          />
        ))}
      </View>

      {/* Product grid */}
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={{ flex: 1 }}>
            <ProductCard
              product={item}
              liked={favourites.includes(item.id)}
              onToggleLike={() => actions.toggleFavourite(item.id)}
              onPress={() => router.push({ pathname: '/shops', params: { q: item.name.split(' ').pop() } })}
            />
          </Animated.View>
        )}
      />
      {/* AI decorate entry point — floating bubble (NFR-08: preview in ≤4 taps) */}
      <AiBubble onPress={() => router.push('/generate')} />
      <BottomNav />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
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
    paddingHorizontal: 20, paddingBottom: 18,
  },
  sectionTitle: { ...Type.subtitle, color: C.text, paddingHorizontal: 20, marginBottom: 10 },
  decoratorsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card,
    borderRadius: 16, padding: 12, marginHorizontal: 20, marginBottom: 18,
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
  grid: { paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
});

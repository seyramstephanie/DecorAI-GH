import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Shadow, Type } from '../constants/theme';
import { Palette, useColors } from '../lib/theme';

// Onboarding per UI reference: logo top, hero graphic, bold two-line headline,
// muted subtitle, dash page-dots, one big pill button — in our system colors.
const { width } = Dimensions.get('window');

const ROOM_1 = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80';
const ROOM_2 = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80';
const FACE_1 = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80';
const FACE_2 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80';
const FACE_3 = 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=200&q=80';

const SLIDES = [
  {
    hero: 'cards' as const,
    title: 'See your space\ntransformed in seconds',
    body: 'Snap your room, hall or venue and watch AI redecorate it — before you spend a single cedi.',
  },
  {
    hero: 'decorators' as const,
    title: 'Book trusted\nlocal decorators',
    body: 'Verified decorators receive your AI design as a brief, with ratings and reviews you can trust.',
  },
  {
    hero: 'orbit' as const,
    title: 'Source every item\nfrom shops near you',
    body: 'Furniture, fabrics and décor — everything in your design, matched to Ghanaian shops around you.',
  },
];

export default function Onboarding() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const offset = useScrollViewOffset(scrollRef);
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);

  // Skip lands on the auth page — signing in (or up) is still required
  const skip = () => router.replace('/create-account');

  const next = () => {
    if (pageRef.current >= SLIDES.length - 1) return router.replace('/create-account');
    scrollRef.current?.scrollTo({ x: width * (pageRef.current + 1), animated: true });
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Logo alone (no box) + Skip */}
      <View style={styles.logoRow}>
        <BrandLogo size={48} style={styles.logo} />
        <Pressable onPress={skip} style={styles.skip} hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const p = Math.round(e.nativeEvent.contentOffset.x / width);
          pageRef.current = p; setPage(p);
        }}
        style={{ flexGrow: 0 }}
      >
        {SLIDES.map((s) => (
          <View key={s.hero} style={{ width, paddingHorizontal: 28 }}>
            <View style={styles.heroArea}>
              {s.hero === 'cards' && <CardsHero />}
              {s.hero === 'decorators' && <DecoratorsHero />}
              {s.hero === 'orbit' && <OrbitHero />}
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Dash-style page dots — active dot stretches into a dash */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => <Dot key={i} index={i} offset={offset} />)}
      </View>

      <View style={{ paddingHorizontal: 28 }}>
        <Pressable onPress={next} style={({ pressed }) => [styles.cta, Shadow.float, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Text style={styles.ctaText}>{page === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Slide 1 — tilted stacked room photos with an overlapping pill badge.
function CardsHero() {
  const C = useColors();
  const h = useMemo(() => makeHeroStyles(C), [C]);
  return (
    <View style={h.cardsWrap}>
      <View style={[h.card, h.cardBack]}>
        <Image source={{ uri: ROOM_2 }} style={h.cardImg} />
      </View>
      <View style={[h.card, h.cardFront, Shadow.float]}>
        <Image source={{ uri: ROOM_1 }} style={h.cardImg} />
        <View style={h.badge}><Text style={h.badgeText}>Decorate with AI</Text></View>
      </View>
    </View>
  );
}

// Slide 2 — decorator rows with a rotated count chip; middle card elevated.
function DecoratorsHero() {
  const C = useColors();
  const h = useMemo(() => makeHeroStyles(C), [C]);
  const rows = [
    { img: FACE_1, name: 'Akosua Mensah', sub: '120+ events', featured: false },
    { img: FACE_2, name: 'Royal Touch Décor', sub: '200+ events', featured: true },
    { img: FACE_3, name: 'Adum Blooms', sub: '85+ events', featured: false },
  ];
  return (
    <View style={h.listWrap}>
      <View style={[h.chip, Shadow.card, { alignSelf: 'flex-end', transform: [{ rotate: '8deg' }], marginBottom: 2 }]}>
        <Text style={h.chipText}>100+ Decorators</Text>
      </View>
      {rows.map((r) => (
        <View key={r.name} style={[h.row, r.featured ? [h.rowFeatured, Shadow.float] : null]}>
          <Image source={{ uri: r.img }} style={h.avatar} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={h.rowName}>{r.name}</Text>
              <Ionicons name="checkmark-circle" size={14} color={C.accent} />
            </View>
            <Text style={h.rowSub}>{r.sub}</Text>
          </View>
          <View style={[h.followBtn, r.featured && { backgroundColor: C.primary }]}>
            <Text style={[h.followText, r.featured && { color: C.onPrimary }]}>Book</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// Slide 3 — orbiting category icons around a central hub, with a count chip.
function OrbitHero() {
  const C = useColors();
  const h = useMemo(() => makeHeroStyles(C), [C]);
  const sats = [
    { icon: 'bed-outline' as const, top: 10, left: 30 },
    { icon: 'cart-outline' as const, top: 40, right: 14 },
    { icon: 'color-palette-outline' as const, bottom: 26, left: 14 },
    { icon: 'image-outline' as const, bottom: 6, right: 46 },
  ];
  return (
    <View style={h.orbitWrap}>
      <View style={[h.ring, { width: 250, height: 250, borderRadius: 125 }]} />
      <View style={[h.ring, { width: 170, height: 170, borderRadius: 85 }]} />
      <View style={[h.chip, Shadow.card, h.orbitChip]}>
        <Text style={h.chipText}>30+ Categories</Text>
      </View>
      <View style={[h.hub, Shadow.float]}>
        <Ionicons name="sparkles" size={30} color={C.onPrimary} />
      </View>
      {sats.map((s) => (
        <View key={s.icon} style={[h.sat, Shadow.card, s]}>
          <Ionicons name={s.icon} size={22} color={C.primary} />
        </View>
      ))}
    </View>
  );
}

function Dot({ index, offset }: { index: number; offset: { value: number } }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const style = useAnimatedStyle(() => {
    const page = offset.value / width;
    return {
      width: interpolate(page, [index - 1, index, index + 1], [7, 26, 7], 'clamp'),
      opacity: interpolate(page, [index - 1, index, index + 1], [0.3, 1, 0.3], 'clamp'),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, justifyContent: 'space-between', paddingVertical: 14 },
  logoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, minHeight: 56, marginBottom: 4, position: 'relative',
  },
  logo: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  skip: { position: 'absolute', right: 20, paddingVertical: 8, paddingHorizontal: 4 },
  skipText: { ...Type.body, fontWeight: '600', color: C.textMuted },
  heroArea: { height: 320, justifyContent: 'center', marginTop: 8, marginBottom: 22 },
  title: {
    fontSize: 28, fontWeight: '800', color: C.text, textAlign: 'center',
    letterSpacing: -0.6, lineHeight: 34, marginBottom: 12,
  },
  body: { ...Type.body, fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 21, paddingHorizontal: 8 },
  dots: { flexDirection: 'row', gap: 6, alignSelf: 'center', marginVertical: 22, alignItems: 'center' },
  dot: { height: 7, borderRadius: 4, backgroundColor: C.primary },
  cta: {
    height: 58, borderRadius: 29, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: C.onPrimary },
});

const makeHeroStyles = (C: Palette) => StyleSheet.create({
  // slide 1
  cardsWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  card: { width: 230, height: 250, borderRadius: 26, backgroundColor: C.card, padding: 10 },
  cardBack: { position: 'absolute', transform: [{ rotate: '-10deg' }, { translateX: -34 }, { translateY: -8 }], opacity: 0.9 },
  cardFront: { transform: [{ rotate: '5deg' }, { translateX: 16 }] },
  cardImg: { flex: 1, borderRadius: 18 },
  badge: {
    position: 'absolute', bottom: 26, right: -14, backgroundColor: C.text,
    borderRadius: 18, paddingHorizontal: 14, height: 36, justifyContent: 'center',
  },
  badgeText: { color: C.bg, fontSize: 12, fontWeight: '700' },
  // slide 2
  listWrap: { gap: 10, justifyContent: 'center', flex: 1 },
  chip: {
    backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 12,
    paddingVertical: 7, borderWidth: 1, borderColor: C.border,
  },
  chipText: { fontSize: 11, fontWeight: '700', color: C.text },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.cardMuted,
    borderRadius: 20, padding: 12, marginHorizontal: 6,
  },
  rowFeatured: { backgroundColor: C.card, marginHorizontal: 0 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  rowName: { fontSize: 14, fontWeight: '700', color: C.text },
  rowSub: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  followBtn: {
    backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 16,
    height: 32, justifyContent: 'center',
  },
  followText: { fontSize: 12, fontWeight: '700', color: C.text },
  // slide 3
  orbitWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: C.border },
  orbitChip: { position: 'absolute', top: 6, right: 22 },
  hub: {
    width: 86, height: 86, borderRadius: 43, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sat: {
    position: 'absolute', width: 54, height: 54, borderRadius: 27, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Glass, GlassCard } from '../components/ui/Glass';
import { MeshBackdrop } from '../components/ui/MeshBackdrop';
import { TiltCard } from '../components/ui/TiltCard';
import { Radii, Type } from '../constants/theme';
import {
  getProduct,
  getShopProducts,
  LOOKBOOK_SHOP,
  PRODUCTS,
  type Product,
} from '../data/seed';
import { actions, useStore } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

const { width: W } = Dimensions.get('window');
const HERO_H = 420;

/** Immersive product + Look Studio shop page (Lenis-like scroll + 3D tilt). */
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id ?? '') ?? PRODUCTS[0];
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favourites } = useStore();
  const liked = favourites.includes(product.id);
  const [frame, setFrame] = useState(0);
  const scrollY = useSharedValue(0);

  const shop = LOOKBOOK_SHOP;
  const related = getShopProducts(shop.id).filter((p) => p.id !== product.id).slice(0, 4);
  const gallery = product.gallery?.length ? product.gallery : [product.image];

  // Lenis-like momentum feel: track scroll for parallax / fade
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const heroParallax = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [-80, 0, HERO_H], [-30, 0, HERO_H * 0.35], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(scrollY.value, [-80, 0], [1.08, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const heroFade = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HERO_H * 0.55], [1, 0.15], Extrapolation.CLAMP),
  }));

  const stickyBar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_H - 120, HERO_H - 40], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [HERO_H - 120, HERO_H - 40], [-12, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <View style={styles.screen}>
      {/* Sticky mini bar after scroll (app chrome) */}
      <Animated.View style={[styles.sticky, { paddingTop: insets.top + 6 }, stickyBar]} pointerEvents="box-none">
        <Glass intensity="strong" style={styles.stickyInner}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={C.text} />
          </Pressable>
          <Text style={styles.stickyTitle} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.stickyPrice}>GH₵{product.price.toLocaleString()}</Text>
        </Glass>
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        // Smoother deceleration ≈ Lenis inertia on native
        decelerationRate="normal"
        bounces
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        {/* Hero with mesh + parallax gallery */}
        <View style={styles.heroWrap}>
          <MeshBackdrop height={HERO_H} />
          <Animated.View style={[styles.heroLayer, heroParallax, heroFade]}>
            <TiltCard style={styles.tilt}>
              <Image
                source={{ uri: gallery[frame] }}
                style={styles.heroImg}
                contentFit="cover"
                transition={400}
              />
              <LinearGradient
                colors={['transparent', 'rgba(31,26,22,0.55)']}
                style={styles.heroGrad}
              />
            </TiltCard>
          </Animated.View>

          <View style={[styles.heroChrome, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()}>
              <Glass isInteractive glassEffectStyle="clear" style={styles.iconBtn}>
                <Ionicons name="chevron-back" size={20} color={C.text} />
              </Glass>
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => actions.toggleFavourite(product.id)}>
              <Glass isInteractive glassEffectStyle="clear" style={styles.iconBtn}>
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={liked ? C.heart : C.text}
                />
              </Glass>
            </Pressable>
          </View>

          {/* Gallery filmstrip */}
          <View style={styles.film}>
            {gallery.map((uri, i) => (
              <Pressable key={uri + i} onPress={() => setFrame(i)}>
                <Image
                  source={{ uri }}
                  style={[styles.thumb, frame === i && styles.thumbActive]}
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Product copy */}
        <Animated.View entering={FadeInDown.duration(420)} style={styles.sheet}>
          <View style={styles.tagRow}>
            {!!product.tag && (
              <View style={styles.tag}><Text style={styles.tagText}>{product.tag}</Text></View>
            )}
            <View style={styles.tagMuted}><Text style={styles.tagMutedText}>{product.category}</Text></View>
            <View style={styles.tagMuted}>
              <Text style={styles.tagMutedText}>{product.inStock} in stock</Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>GH₵{product.price.toLocaleString()}</Text>
          <Text style={styles.desc}>{product.description}</Text>

          <Text style={styles.section}>Materials</Text>
          <View style={styles.chips}>
            {product.materials.map((m) => (
              <Glass key={m} glassEffectStyle="clear" style={styles.chip}>
                <Text style={styles.chipText}>{m}</Text>
              </Glass>
            ))}
          </View>

          <Text style={styles.section}>Colours</Text>
          <View style={styles.chips}>
            {product.colors.map((c) => (
              <View key={c} style={styles.colorChip}>
                <View style={[styles.swatch, { backgroundColor: swatchFor(c, C) }]} />
                <Text style={styles.chipText}>{c}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>Dimensions</Text>
          <Text style={styles.meta}>{product.dimensions}</Text>

          {/* Look Studio shop card */}
          <Text style={styles.section}>Available at</Text>
          <Pressable onPress={() => router.push({ pathname: '/shop-lookbook' as any })}>
            <GlassCard isInteractive style={styles.shopCard}>
              <Image source={{ uri: shop.image }} style={styles.shopImg} contentFit="cover" />
              <View style={{ flex: 1, gap: 3 }}>
                <View style={styles.shopTitleRow}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  {shop.verified && <Ionicons name="checkmark-circle" size={16} color={C.success} />}
                </View>
                <Text style={styles.meta}>{shop.area}, {shop.location}</Text>
                <View style={styles.row}>
                  <Ionicons name="star" size={13} color={C.accent} />
                  <Text style={styles.metaDark}>{shop.rating} ({shop.reviews})</Text>
                </View>
                <Text style={styles.shopHours}>{shop.hours}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textLight} />
            </GlassCard>
          </Pressable>

          <View style={styles.actions}>
            <Button
              title="Call shop"
              variant="outline"
              icon="call-outline"
              onPress={() => Linking.openURL(`tel:${shop.phone.replace(/\s/g, '')}`)}
              style={{ flex: 1, height: 50 }}
            />
            <Button
              title="Get directions"
              icon="navigate-outline"
              onPress={() =>
                router.push({
                  pathname: '/place-map',
                  params: { id: 's7', type: 'shop' },
                })
              }
              style={{ flex: 1, height: 50 }}
            />
          </View>

          {/* Related from Look Studio */}
          <Text style={styles.section}>More from Look Studio</Text>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={168}
            contentContainerStyle={{ gap: 12, paddingRight: 8 }}
          >
            {related.map((p, i) => (
              <RelatedCard key={p.id} product={p} index={i} onPress={() => router.replace({ pathname: '/product-detail' as any, params: { id: p.id } })} />
            ))}
          </Animated.ScrollView>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

function RelatedCard({ product, index, onPress }: { product: Product; index: number; onPress: () => void }) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(380)}>
      <Pressable onPress={onPress} style={styles.related}>
        <Image source={{ uri: product.image }} style={styles.relatedImg} contentFit="cover" />
        <Text numberOfLines={2} style={styles.relatedName}>{product.name}</Text>
        <Text style={styles.relatedPrice}>GH₵{product.price.toLocaleString()}</Text>
      </Pressable>
    </Animated.View>
  );
}

function swatchFor(label: string, C: Palette): string {
  const l = label.toLowerCase();
  if (l.includes('sand') || l.includes('honey') || l.includes('oak') || l.includes('ochre')) return '#C4A574';
  if (l.includes('charcoal') || l.includes('ink') || l.includes('black')) return '#2C2420';
  if (l.includes('terracotta') || l.includes('sienna') || l.includes('clay')) return C.primary;
  if (l.includes('green') || l.includes('forest') || l.includes('sage') || l.includes('verde')) return '#4A7C59';
  if (l.includes('blue')) return '#3D5A80';
  if (l.includes('ivory') || l.includes('white') || l.includes('carrara') || l.includes('bleached')) return '#F2EDE6';
  if (l.includes('walnut')) return '#5C4033';
  return C.accentSoft;
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  sticky: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, paddingHorizontal: 12,
  },
  stickyInner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 22, paddingHorizontal: 8, paddingVertical: 8, overflow: 'hidden',
  },
  stickyTitle: { ...Type.caption, fontWeight: '700', color: C.text, flex: 1 },
  stickyPrice: { ...Type.caption, fontWeight: '800', color: C.primary, marginRight: 8 },
  heroWrap: { height: HERO_H, width: W },
  heroLayer: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 56,
    justifyContent: 'center',
  },
  tilt: { flex: 1, borderRadius: 28 },
  heroImg: { flex: 1, borderRadius: 28 },
  heroGrad: { ...StyleSheet.absoluteFillObject, borderRadius: 28 },
  heroChrome: {
    position: 'absolute', top: 0, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 5,
  },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  film: {
    position: 'absolute', bottom: 16, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 8, zIndex: 5,
  },
  thumb: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 2, borderColor: 'transparent',
  },
  thumbActive: { borderColor: C.primary },
  sheet: {
    marginTop: -18,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 4,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tag: {
    backgroundColor: C.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  tagText: { color: C.onPrimary, fontSize: 11, fontWeight: '800' },
  tagMuted: {
    backgroundColor: C.accentSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  tagMutedText: { color: C.primary, fontSize: 11, fontWeight: '700' },
  name: { ...Type.hero, color: C.text, fontSize: 24 },
  price: { ...Type.title, color: C.primary, marginTop: 4, marginBottom: 10 },
  desc: { ...Type.body, color: C.textMuted, lineHeight: 21, marginBottom: 8 },
  section: { ...Type.subtitle, color: C.text, marginTop: 18, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, overflow: 'hidden',
  },
  chipText: { ...Type.caption, color: C.text, fontWeight: '600' },
  colorChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.cardMuted, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8,
  },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  meta: { ...Type.body, color: C.textMuted },
  metaDark: { ...Type.caption, color: C.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shopCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: Radii.lg,
  },
  shopImg: { width: 64, height: 64, borderRadius: 14 },
  shopTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shopName: { ...Type.subtitle, color: C.text, fontSize: 15 },
  shopHours: { ...Type.caption, color: C.textLight, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  related: { width: 156 },
  relatedImg: { width: 156, height: 130, borderRadius: Radii.md, backgroundColor: C.cardMuted },
  relatedName: { ...Type.caption, fontWeight: '700', color: C.text, marginTop: 8 },
  relatedPrice: { ...Type.caption, color: C.primary, fontWeight: '800', marginTop: 2 },
});

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { Radii, Type } from '../constants/theme';
import { LOOKBOOK_SHOP, PRODUCTS } from '../data/seed';
import { Palette, useColors } from '../lib/theme';

const { width: W } = Dimensions.get('window');
const COVER_H = 280;

/** Flagship shop that carries every Shop the look product. */
export default function ShopLookbook() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const shop = LOOKBOOK_SHOP;
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const coverAnim = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, COVER_H], [0, COVER_H * 0.4], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        contentContainerStyle={{ paddingBottom: 36 + insets.bottom }}
      >
        <View style={styles.coverWrap}>
          <MeshBackdrop height={COVER_H} />
          <Animated.View style={[StyleSheet.absoluteFill, coverAnim]}>
            <Image source={{ uri: shop.cover }} style={styles.cover} contentFit="cover" />
            <LinearGradient colors={['rgba(31,26,22,0.15)', 'rgba(31,26,22,0.75)']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()}>
              <Glass isInteractive glassEffectStyle="clear" style={styles.iconBtn}>
                <Ionicons name="chevron-back" size={20} color={C.onPrimary} />
              </Glass>
            </Pressable>
          </View>
          <View style={styles.coverCopy}>
            <View style={styles.verified}>
              <Ionicons name="checkmark-circle" size={14} color={C.success} />
              <Text style={styles.verifiedText}>Verified Look Studio</Text>
            </View>
            <Text style={styles.coverTitle}>{shop.name}</Text>
            <Text style={styles.coverMeta}>{shop.area}, {shop.location} · {shop.rating} ★</Text>
          </View>
        </View>

        <View style={styles.body}>
          <GlassCard style={styles.bioCard}>
            <Text style={styles.bio}>{shop.bio}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={C.primary} />
              <Text style={styles.infoText}>{shop.hours}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color={C.primary} />
              <Text style={styles.infoText}>{shop.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={C.primary} />
              <Text style={styles.infoText}>{shop.area}, {shop.location}</Text>
            </View>
          </GlassCard>

          <View style={styles.actions}>
            <Button
              title="Call"
              variant="outline"
              icon="call-outline"
              onPress={() => Linking.openURL(`tel:${shop.phone.replace(/\s/g, '')}`)}
              style={{ flex: 1, height: 48 }}
            />
            <Button
              title="Map"
              icon="map-outline"
              onPress={() => router.push({ pathname: '/place-map', params: { id: 's7', type: 'shop' } })}
              style={{ flex: 1, height: 48 }}
            />
          </View>

          <Text style={styles.section}>Full lookbook · {PRODUCTS.length} pieces</Text>
          <Text style={styles.sectionHint}>Every item from Shop the look, styled and in stock</Text>

          <View style={styles.grid}>
            {PRODUCTS.map((p, i) => (
              <Animated.View
                key={p.id}
                entering={FadeInDown.delay(Math.min(i, 10) * 50).duration(400)}
                style={styles.cell}
              >
                <Pressable
                  onPress={() => router.push({ pathname: '/product-detail' as any, params: { id: p.id } })}
                  style={styles.card}
                >
                  <Image source={{ uri: p.image }} style={styles.img} contentFit="cover" transition={280} />
                  {!!p.tag && (
                    <View style={styles.badge}><Text style={styles.badgeText}>{p.tag}</Text></View>
                  )}
                  <Text numberOfLines={2} style={styles.name}>{p.name}</Text>
                  <Text style={styles.price}>GH₵{p.price.toLocaleString()}</Text>
                  <Text style={styles.stock}>{p.inStock} available</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  coverWrap: { height: COVER_H, width: W },
  cover: { ...StyleSheet.absoluteFillObject },
  topBar: { position: 'absolute', top: 0, left: 16, right: 16, zIndex: 4 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  coverCopy: { position: 'absolute', left: 20, right: 20, bottom: 22, zIndex: 3 },
  verified: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  verifiedText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  coverTitle: { ...Type.hero, color: '#fff', fontSize: 26 },
  coverMeta: { color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
  body: { paddingHorizontal: 20, paddingTop: 16 },
  bioCard: { padding: 16, borderRadius: Radii.lg, gap: 10 },
  bio: { ...Type.body, color: C.text, lineHeight: 21 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { ...Type.caption, color: C.textMuted, flex: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  section: { ...Type.subtitle, color: C.text, marginTop: 22 },
  sectionHint: { ...Type.caption, color: C.textMuted, marginBottom: 14, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  cell: { width: '48%' },
  card: { gap: 4 },
  img: { width: '100%', height: 150, borderRadius: Radii.md, backgroundColor: C.cardMuted },
  badge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: C.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { color: C.onPrimary, fontSize: 10, fontWeight: '800' },
  name: { ...Type.caption, fontWeight: '700', color: C.text, marginTop: 6 },
  price: { ...Type.caption, color: C.primary, fontWeight: '800' },
  stock: { fontSize: 11, color: C.textLight },
});

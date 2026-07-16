import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Radii, Shadow, Type } from '../constants/theme';
import { Palette, useColors } from '../lib/theme';
import { generateDecoration } from '../lib/ai';
import { actions, useStore } from '../lib/store';

// Object-type toggles per UI reference (armchair / lamp / frame / plant)
const OBJECT_TYPES = [
  { icon: 'seat-outline', match: ['sofa', 'chair', 'furniture', 'table', 'seat', 'cushion'] },
  { icon: 'lamp', match: ['lamp', 'light', 'chandelier', 'uplight'] },
  { icon: 'image-frame', match: ['frame', 'art', 'portrait', 'backdrop', 'banner'] },
  { icon: 'flower-outline', match: ['flower', 'plant', 'floral', 'wreath', 'centrepiece'] },
] as const;

export default function Result() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const { brief, variants } = useStore();
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [objType, setObjType] = useState(0);
  const [saving, setSaving] = useState(false);
  const running = useRef(false);

  const MAX_VARIANTS = 3; // FR-12

  const generate = useCallback(async () => {
    if (!brief || running.current) return;
    running.current = true;
    setError(null);
    try {
      const variant = variants.length + 1;
      const result = await generateDecoration(
        brief.photoB64, brief.eventType,
        variant === 1 ? brief.style : `${brief.style}, interpretation ${variant} — a distinctly different take`,
        brief.vision, setStage,
      );
      actions.addVariant(result);
      setIndex(variants.length);
    } catch (e: any) {
      setError(e.message);
    } finally {
      running.current = false;
      setStage(null);
    }
  }, [brief, variants.length]);

  useEffect(() => { if (brief && variants.length === 0) generate(); }, [brief, generate, variants.length]);

  if (!brief) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}><Text style={Type.body}>No brief — start from Decorate with AI.</Text></View>
      </SafeAreaView>
    );
  }

  const current = variants[index];
  const filteredItems = current
    ? current.items.filter((i) => OBJECT_TYPES[objType].match.some((m) => i.toLowerCase().includes(m)))
    : [];
  const shownItems = filteredItems.length ? filteredItems : current?.items ?? [];

  const save = () => {
    if (!current || saving) return;
    setSaving(true);
    actions.saveDesign({
      id: `${Date.now()}`, imageBase64: current.imageBase64, items: current.items,
      eventType: brief.eventType, style: brief.style, vision: brief.vision,
      createdAt: new Date().toISOString(),
    });
    // brief moment so the button shows feedback, then open saved grid
    setTimeout(() => {
      setSaving(false);
      router.push('/saved');
    }, 250);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Top bar — per UI reference: ← 01/10 → and ✕ */}
      <View style={styles.topBar}>
        <Pressable onPress={() => setIndex(Math.max(0, index - 1))} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={index === 0 ? C.textLight : C.text} />
        </Pressable>
        <Text style={styles.counter}>
          <Text style={{ color: C.accent }}>{String(index + 1).padStart(2, '0')}</Text>
          /{String(Math.max(variants.length, 1)).padStart(2, '0')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <Pressable onPress={() => setIndex(Math.min(variants.length - 1, index + 1))} hitSlop={10}>
            <Ionicons name="arrow-forward" size={22} color={index >= variants.length - 1 ? C.textLight : C.text} />
          </Pressable>
          <Pressable onPress={() => router.replace('/home')} hitSlop={10}>
            <Ionicons name="close" size={24} color={C.text} />
          </Pressable>
        </View>
      </View>

      {/* Preview */}
      <View style={styles.previewWrap}>
        {current ? (
          <Animated.View entering={FadeIn.duration(400)} style={[styles.preview, Shadow.card]}>
            <Image
              source={{ uri: `data:image/png;base64,${current.imageBase64}` }}
              style={{ flex: 1 }} contentFit="cover" transition={300}
            />
            {current.attempts > 1 && (
              <View style={styles.attemptTag}>
                <Ionicons name="shield-checkmark" size={12} color={C.white} />
                <Text style={styles.attemptText}>structure checked ×{current.attempts}</Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <View style={[styles.preview, styles.center, { backgroundColor: C.cardMuted }]}>
            {error ? (
              <View style={{ alignItems: 'center', gap: 14, paddingHorizontal: 30 }}>
                <Ionicons name="cloud-offline-outline" size={34} color={C.textMuted} />
                <Text style={[Type.body, { color: C.textMuted, textAlign: 'center' }]}>{error}</Text>
                <Button title="Try again" onPress={generate} style={{ height: 44 }} />
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 14 }}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={[Type.body, { color: C.textMuted }]}>{stage ?? 'Preparing…'}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom sheet — object-type toggles + identified items + actions */}
      <Animated.View entering={FadeInUp.duration(450)} style={[styles.sheet, Shadow.float]}>
        <View style={styles.toggles}>
          {OBJECT_TYPES.map((t, i) => (
            <Pressable
              key={t.icon}
              onPress={() => setObjType(i)}
              style={[styles.toggle, i === objType && styles.toggleActive]}
            >
              <MaterialCommunityIcons name={t.icon} size={26} color={i === objType ? C.onPrimary : C.text} />
            </Pressable>
          ))}
        </View>

        {current && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.items}>
            {shownItems.map((item) => (
              <View key={item} style={styles.itemChip}><Text style={styles.itemText}>{item}</Text></View>
            ))}
          </ScrollView>
        )}

        <View style={styles.actionsRow}>
          <Button
            title={variants.length < MAX_VARIANTS ? 'New variant' : 'Max variants'}
            variant="outline" icon="color-wand-outline"
            onPress={generate}
            disabled={!current || !!stage || variants.length >= MAX_VARIANTS}
            style={{ flex: 1, height: 46 }}
          />
          <Button title={saving ? 'Saved' : 'Save'} variant="ghost" icon="heart-outline" onPress={save} loading={saving} disabled={!current} style={{ flex: 1, height: 46 }} />
          <Button
            title="Share" variant="ghost" icon="share-social-outline"
            onPress={() => Share.share({ message: `My DecorAI GH ${brief.eventType} design — ${brief.style} style. Items: ${current?.items.join(', ')}` })}
            disabled={!current} style={{ flex: 1, height: 46 }}
          />
        </View>
        <View style={styles.actionsRow}>
          <Button
            title="Find items in shops" icon="cart-outline"
            onPress={() => router.push({ pathname: '/shops', params: { items: JSON.stringify(current?.items ?? []) } })}
            disabled={!current} style={{ flex: 1, height: 50 }}
          />
          <Button
            title="Send to decorator" variant="outline" icon="person-outline"
            onPress={() => router.push({ pathname: '/decorators', params: { designId: 'current' } })}
            disabled={!current} style={{ flex: 1, height: 50 }}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  counter: { ...Type.subtitle, color: C.textMuted, letterSpacing: 1 },
  previewWrap: { flex: 1, paddingHorizontal: 20 },
  preview: { flex: 1, borderRadius: Radii.lg, overflow: 'hidden', backgroundColor: C.card },
  attemptTag: {
    position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.overlay, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
  },
  attemptText: { color: C.white, fontSize: 11, fontWeight: '600' },
  sheet: {
    backgroundColor: C.card, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl,
    padding: 20, gap: 14, marginTop: 16,
  },
  // 4 object-type toggles share the full row width, so the block sits centered
  toggles: { flexDirection: 'row', gap: 12 },
  toggle: {
    flex: 1, height: 58, borderRadius: Radii.md, backgroundColor: C.cardMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleActive: { backgroundColor: C.primary },
  items: { gap: 8 },
  itemChip: {
    backgroundColor: C.accentSoft, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7,
  },
  itemText: { ...Type.caption, color: C.primary },
  actionsRow: { flexDirection: 'row', gap: 10 },
});

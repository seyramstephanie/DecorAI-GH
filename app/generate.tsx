import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { DynamicIsland } from '../components/ui/DynamicIsland';
import { Glass, GlassCard } from '../components/ui/Glass';
import { PhotoSheet } from '../components/ui/PhotoSheet';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Radii, Type } from '../constants/theme';
import { EVENT_TYPES, PROMPT_TEMPLATES, STYLES } from '../data/seed';
import { session } from '../lib/session';
import { actions } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

// Icon map for a structured selection grid (Dribbble-style tile selectors)
const EVENT_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; hint: string }> = {
  Wedding: { icon: 'heart', hint: 'Ceremonies' },
  Funeral: { icon: 'flower-outline', hint: 'Memorials' },
  Birthday: { icon: 'gift-outline', hint: 'Parties' },
  'Church Anniversary': { icon: 'business-outline', hint: 'Worship' },
  Corporate: { icon: 'briefcase-outline', hint: 'Events' },
  'Home Interior': { icon: 'home-outline', hint: 'Spaces' },
};

const STYLE_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; hint: string }> = {
  Modern: { icon: 'sparkles-outline', hint: 'Clean lines' },
  Traditional: { icon: 'color-palette-outline', hint: 'Heritage' },
  Rustic: { icon: 'leaf-outline', hint: 'Natural' },
  Luxury: { icon: 'diamond-outline', hint: 'Premium' },
};

export default function Generate() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const sheetRef = useRef<BottomSheet>(null);
  const params = useLocalSearchParams<{ eventType?: string }>();
  const [photo, setPhoto] = useState<{ uri: string; b64: string } | null>(null);
  const [eventType, setEventType] = useState(
    params.eventType && EVENT_TYPES.includes(params.eventType) ? params.eventType : EVENT_TYPES[0],
  );
  const [style, setStyle] = useState(STYLES[0]);
  const [vision, setVision] = useState('');
  const [island, setIsland] = useState(false);

  // Free users: browse + text only. Pro (or admin) unlocks AI decorate.
  if (!session.canUseAi()) {
    return <Redirect href={'/pro' as any} />;
  }

  const start = () => {
    if (!photo) return;
    actions.setBrief({ eventType, style, vision, photoB64: photo.b64 });
    router.push('/result');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <DynamicIsland
        visible={island}
        title="Photo ready"
        subtitle="Fullscreen capture attached"
        icon="camera"
        onPress={() => setIsland(false)}
        onDismiss={() => setIsland(false)}
      />
      <ScreenHeader title="Decorate with AI" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {photo ? (
          <GlassCard style={styles.photoBox}>
            <Image source={{ uri: photo.uri }} style={styles.photo} contentFit="cover" />
            <Pressable style={styles.retake} onPress={() => setPhoto(null)}>
              <Ionicons name="close" size={18} color={C.white} />
            </Pressable>
          </GlassCard>
        ) : (
          <Pressable onPress={() => sheetRef.current?.expand()}>
            <Glass isInteractive glassEffectStyle="clear" style={styles.uploadHero}>
              <Ionicons name="camera-outline" size={32} color={C.primary} />
              <Text style={styles.uploadTitle}>Add room photo</Text>
              <Text style={styles.uploadSub}>Fullscreen camera or gallery · glass drawer</Text>
            </Glass>
          </Pressable>
        )}

        {/* Event type — equal 2-column selection grid */}
        <Text style={styles.section}>Event type</Text>
        <Text style={styles.sectionHint}>Pick the space or occasion you are designing for</Text>
        <View style={styles.grid}>
          {EVENT_TYPES.map((e) => {
            const meta = EVENT_META[e] ?? { icon: 'sparkles-outline' as const, hint: 'Event' };
            const active = eventType === e;
            return (
              <Pressable key={e} onPress={() => setEventType(e)} style={styles.gridCell}>
                <Glass
                  isInteractive
                  glassEffectStyle={active ? 'regular' : 'clear'}
                  tintColor={active ? 'rgba(154,74,31,0.38)' : undefined}
                  style={[styles.tile, active && styles.tileActive]}
                >
                  <View style={[styles.tileIcon, active && styles.tileIconActive]}>
                    <Ionicons name={meta.icon} size={20} color={active ? C.onPrimary : C.primary} />
                  </View>
                  <Text style={[styles.tileTitle, active && styles.tileTitleActive]} numberOfLines={2}>
                    {e}
                  </Text>
                  <Text style={[styles.tileHint, active && { color: C.primaryLight }]} numberOfLines={1}>
                    {meta.hint}
                  </Text>
                  {active && (
                    <View style={styles.check}>
                      <Ionicons name="checkmark" size={12} color={C.onPrimary} />
                    </View>
                  )}
                </Glass>
              </Pressable>
            );
          })}
        </View>

        {/* Style — equal 2-column grid */}
        <Text style={styles.section}>Style</Text>
        <Text style={styles.sectionHint}>Mood and finish for the generation</Text>
        <View style={styles.grid}>
          {STYLES.map((s) => {
            const meta = STYLE_META[s] ?? { icon: 'color-wand-outline' as const, hint: 'Look' };
            const active = style === s;
            return (
              <Pressable key={s} onPress={() => setStyle(s)} style={styles.gridCell}>
                <Glass
                  isInteractive
                  glassEffectStyle={active ? 'regular' : 'clear'}
                  tintColor={active ? 'rgba(154,74,31,0.38)' : undefined}
                  style={[styles.tile, styles.tileCompact, active && styles.tileActive]}
                >
                  <View style={[styles.tileIcon, active && styles.tileIconActive]}>
                    <Ionicons name={meta.icon} size={18} color={active ? C.onPrimary : C.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.tileTitle, active && styles.tileTitleActive]} numberOfLines={1}>
                      {s}
                    </Text>
                    <Text style={[styles.tileHint, active && { color: C.primaryLight }]} numberOfLines={1}>
                      {meta.hint}
                    </Text>
                  </View>
                  {active && (
                    <View style={styles.checkInline}>
                      <Ionicons name="checkmark" size={12} color={C.onPrimary} />
                    </View>
                  )}
                </Glass>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>Templates</Text>
        <Text style={styles.sectionHint}>Tap one to seed your vision — edit freely below</Text>
        {(PROMPT_TEMPLATES[eventType] || []).map((t) => (
          <Pressable key={t} onPress={() => setVision(t)}>
            <Glass
              isInteractive
              glassEffectStyle={vision === t ? 'regular' : 'clear'}
              tintColor={vision === t ? 'rgba(154,74,31,0.28)' : undefined}
              style={[styles.template, vision === t && styles.templateActive]}
            >
              <Ionicons
                name={vision === t ? 'checkmark-circle' : 'sparkles-outline'}
                size={18} color={vision === t ? C.primary : C.textLight}
              />
              <Text style={[styles.templateText, vision === t && { color: C.text }]}>{t}</Text>
            </Glass>
          </Pressable>
        ))}

        <Text style={styles.section}>Your vision</Text>
        <Glass style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Describe your dream decoration, or tap a template above and edit it…"
            placeholderTextColor={C.textLight}
            value={vision}
            onChangeText={setVision}
            multiline
          />
        </Glass>

        <Button title="Generate preview" icon="sparkles" onPress={start} disabled={!photo} style={{ marginTop: 12 }} />
      </ScrollView>

      <PhotoSheet
        ref={sheetRef}
        onPicked={(p) => {
          setPhoto(p);
          setIsland(true);
          setTimeout(() => setIsland(false), 2800);
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 20, paddingBottom: 40 },
  uploadHero: {
    height: 140, borderRadius: Radii.md,
    alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden',
  },
  uploadTitle: { ...Type.subtitle, color: C.text },
  uploadSub: { ...Type.caption, color: C.textMuted },
  photoBox: { borderRadius: Radii.md, overflow: 'hidden', height: 220 },
  photo: { flex: 1 },
  retake: {
    position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center',
  },
  section: { ...Type.subtitle, color: C.text, marginTop: 24, marginBottom: 4 },
  sectionHint: { ...Type.caption, color: C.textMuted, marginBottom: 12, lineHeight: 16 },

  // Consistent 2-column grid — equal cells, fixed gap (Dribbble selection pattern)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridCell: {
    width: '48%', // two equal columns with room for gap
  },
  tile: {
    minHeight: 118,
    borderRadius: Radii.md,
    padding: 14,
    overflow: 'hidden',
    gap: 8,
  },
  tileCompact: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tileActive: {
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconActive: {
    backgroundColor: C.primary,
  },
  tileTitle: {
    ...Type.caption,
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    lineHeight: 17,
  },
  tileTitleActive: {
    color: C.primary,
  },
  tileHint: {
    fontSize: 11,
    color: C.textLight,
    fontWeight: '500',
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  template: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    borderRadius: Radii.sm, padding: 14, marginBottom: 8, overflow: 'hidden',
  },
  templateActive: { borderWidth: 1, borderColor: C.primary },
  templateText: { ...Type.body, color: C.textMuted, flex: 1, lineHeight: 19 },
  inputWrap: { borderRadius: Radii.sm, overflow: 'hidden' },
  input: {
    padding: 14, minHeight: 90, textAlignVertical: 'top', ...Type.body, color: C.text,
  },
});

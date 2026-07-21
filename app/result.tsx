import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Radii, Shadow, Type } from '../constants/theme';
import {
  formatAiErrorForShare,
  generateDecoration,
  type AiErrorLog,
  type DecorateProgress,
} from '../lib/ai';
import { saveDesignToCameraRoll, shareDesign } from '../lib/design-export';
import { actions, useStore } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

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
  const [progress, setProgress] = useState<DecorateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorLog, setErrorLog] = useState<AiErrorLog | null>(null);
  const [index, setIndex] = useState(0);
  const [objType, setObjType] = useState(0);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'share' | 'roll' | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const running = useRef(false);
  const insets = useSafeAreaInsets();

  const MAX_VARIANTS = 3;
  const busy = !!progress && progress.percent < 100;

  const onProgress = useCallback((p: DecorateProgress | string) => {
    if (typeof p === 'string') {
      setProgress((prev) => ({
        percent: prev?.percent ?? 8,
        stage: p,
        attempt: prev?.attempt,
        maxAttempts: prev?.maxAttempts,
      }));
      return;
    }
    setProgress(p);
  }, []);

  const generate = useCallback(async () => {
    if (!brief || running.current) return;
    running.current = true;
    setError(null);
    setErrorLog(null);
    setProgress({ percent: 3, stage: 'Preparing…', attempt: 1, maxAttempts: 3 });
    try {
      const variant = variants.length + 1;
      const result = await generateDecoration(
        brief.photoB64,
        brief.eventType,
        variant === 1 ? brief.style : `${brief.style}, interpretation ${variant} — a distinctly different take`,
        brief.vision,
        onProgress,
      );
      actions.addVariant(result);
      setIndex(variants.length);
      setProgress({ percent: 100, stage: 'Design ready' });
      // brief flash of 100% then clear so UI shows the image
      setTimeout(() => setProgress(null), 400);
    } catch (e: any) {
      setError(e?.message || 'Decoration failed');
      if (e?.aiLog) setErrorLog(e.aiLog as AiErrorLog);
      setProgress(null);
    } finally {
      running.current = false;
    }
  }, [brief, variants.length, onProgress]);

  useEffect(() => {
    if (brief && variants.length === 0) generate();
  }, [brief, generate, variants.length]);

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

  const saveInApp = () => {
    if (!current || saving) return;
    setSaving(true);
    actions.saveDesign({
      id: `${Date.now()}`,
      imageBase64: current.imageBase64,
      items: current.items,
      eventType: brief.eventType,
      style: brief.style,
      vision: brief.vision,
      createdAt: new Date().toISOString(),
      photoB64: brief.photoB64,
    });
    setTimeout(() => {
      setSaving(false);
      router.push('/saved');
    }, 250);
  };

  const onShare = async () => {
    if (!current || exporting) return;
    setExporting('share');
    try {
      await shareDesign({
        imageBase64: current.imageBase64,
        eventType: brief.eventType,
        style: brief.style,
        items: current.items,
      });
    } catch (e: any) {
      Alert.alert('Share failed', e?.message || 'Could not share design');
    } finally {
      setExporting(null);
    }
  };

  const onSaveRoll = async () => {
    if (!current || exporting) return;
    setExporting('roll');
    try {
      const msg = await saveDesignToCameraRoll(current.imageBase64);
      Alert.alert('Saved', msg);
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Could not save to camera roll');
    } finally {
      setExporting(null);
    }
  };

  const shareErrorLog = async () => {
    const text = errorLog
      ? formatAiErrorForShare(errorLog)
      : `DecorAI GH error\n${new Date().toISOString()}\n${error || 'Unknown'}`;
    await Share.share({ message: text, title: 'DecorAI GH error log' });
  };

  const pct = Math.max(0, Math.min(100, progress?.percent ?? 0));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
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

      <View style={styles.previewWrap}>
        {current && !busy ? (
          <Animated.View entering={FadeIn.duration(400)} style={[styles.preview, Shadow.card]}>
            <Pressable style={{ flex: 1 }} onPress={() => setFullscreen(true)}>
              <Image
                source={{ uri: `data:image/png;base64,${current.imageBase64}` }}
                style={{ flex: 1 }} contentFit="cover" transition={300}
              />
            </Pressable>
            <Pressable
              style={styles.expandBtn}
              onPress={() => setFullscreen(true)}
              hitSlop={8}
              accessibilityLabel="Expand image fullscreen"
            >
              <Ionicons name="expand-outline" size={20} color={C.white} />
            </Pressable>
            {current.attempts > 1 && (
              <View style={styles.attemptTag}>
                <Ionicons name="shield-checkmark" size={12} color={C.white} />
                <Text style={styles.attemptText}>structure checked ×{current.attempts}</Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <View style={[styles.preview, styles.center, { backgroundColor: C.cardMuted }]}>
            {error && !busy ? (
              <View style={{ alignItems: 'center', gap: 12, paddingHorizontal: 24 }}>
                <Ionicons name="cloud-offline-outline" size={34} color={C.textMuted} />
                <Text style={[Type.body, { color: C.textMuted, textAlign: 'center' }]}>{error}</Text>
                {errorLog?.stage ? (
                  <Text style={[Type.caption, { color: C.textLight }]}>
                    stage: {errorLog.stage}{errorLog.status != null ? ` · HTTP ${errorLog.status}` : ''}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button title="Try again" onPress={generate} style={{ height: 44, minWidth: 120 }} />
                  <Button title="Share error log" variant="outline" icon="share-outline" onPress={shareErrorLog} style={{ height: 44 }} />
                </View>
              </View>
            ) : (
              <View style={styles.loaderBox}>
                <Text style={styles.pctLabel}>{pct}%</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.stageText}>
                  {progress?.stage ?? 'Processing…'}
                </Text>
                {progress?.attempt != null && progress.maxAttempts != null && progress.attempt > 1 ? (
                  <Text style={styles.retryHint}>
                    Retry {progress.attempt} of {progress.maxAttempts}
                  </Text>
                ) : (
                  <Text style={styles.retryHint}>Decorating your space</Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>

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
            disabled={!current || busy || variants.length >= MAX_VARIANTS}
            style={{ flex: 1, height: 46 }}
          />
          <Button
            title={saving ? 'Saved' : 'Save'}
            variant="ghost" icon="heart-outline"
            onPress={saveInApp}
            loading={saving}
            disabled={!current || busy}
            style={{ flex: 1, height: 46 }}
          />
        </View>
        <View style={styles.actionsRow}>
          <Button
            title={exporting === 'roll' ? 'Saving…' : 'Camera roll'}
            variant="ghost" icon="download-outline"
            onPress={onSaveRoll}
            disabled={!current || busy || !!exporting}
            style={{ flex: 1, height: 46 }}
          />
          <Button
            title={exporting === 'share' ? 'Sharing…' : 'Share'}
            variant="ghost" icon="share-social-outline"
            onPress={onShare}
            disabled={!current || busy || !!exporting}
            style={{ flex: 1, height: 46 }}
          />
        </View>
        <View style={styles.actionsRow}>
          <Button
            title="Find items in shops" icon="cart-outline"
            onPress={() => router.push({ pathname: '/shops', params: { items: JSON.stringify(current?.items ?? []) } })}
            disabled={!current || busy} style={{ flex: 1, height: 50 }}
          />
          <Button
            title="Send to decorator" variant="outline" icon="person-outline"
            onPress={() => router.push({ pathname: '/decorators', params: { designId: 'current' } })}
            disabled={!current || busy} style={{ flex: 1, height: 50 }}
          />
        </View>
      </Animated.View>

      {/* Fullscreen design preview */}
      <Modal
        visible={fullscreen && !!current}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setFullscreen(false)}
        statusBarTranslucent
      >
        <View style={styles.fullscreenRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFullscreen(false)} />
          {current ? (
            <Image
              source={{ uri: `data:image/png;base64,${current.imageBase64}` }}
              style={styles.fullscreenImage}
              contentFit="contain"
              transition={200}
            />
          ) : null}
          <View style={[styles.fullscreenTop, { paddingTop: Math.max(insets.top, 12) }]}>
            <Pressable
              style={styles.fullscreenClose}
              onPress={() => setFullscreen(false)}
              hitSlop={10}
              accessibilityLabel="Close fullscreen"
            >
              <Ionicons name="contract-outline" size={22} color={C.white} />
            </Pressable>
          </View>
          <Text style={[styles.fullscreenHint, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            Tap image background or contract to close
          </Text>
        </View>
      </Modal>
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
  expandBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.overlay,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  attemptTag: {
    position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.overlay, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
  },
  attemptText: { color: C.white, fontSize: 11, fontWeight: '600' },
  fullscreenRoot: {
    flex: 1, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%', height: '100%',
  },
  fullscreenTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  fullscreenClose: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  fullscreenHint: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    textAlign: 'center', color: 'rgba(255,255,255,0.55)',
    fontSize: 12, fontWeight: '500',
  },
  loaderBox: {
    width: '100%',
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
  },
  pctLabel: {
    ...Type.hero,
    fontSize: 36,
    color: C.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  barTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: C.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: C.primary,
  },
  stageText: {
    ...Type.body,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    minHeight: 40,
  },
  retryHint: {
    ...Type.caption,
    color: C.textLight,
    textAlign: 'center',
  },
  sheet: {
    backgroundColor: C.card, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl,
    padding: 20, gap: 14, marginTop: 16,
  },
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

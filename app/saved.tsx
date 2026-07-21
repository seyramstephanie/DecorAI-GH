import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavSpacer } from '../components/ui/BottomNav';
import { EmptyState } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { saveDesignToCameraRoll, shareDesign } from '../lib/design-export';
import { actions, useStore, type SavedDesign } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

// FR-13 — saved decoration designs
export default function Saved() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { saved } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<SavedDesign | null>(null);
  const [exporting, setExporting] = useState<'share' | 'roll' | null>(null);

  const openEdit = (d: SavedDesign) => {
    actions.openSavedForEdit(d);
    setSelected(null);
    router.push('/result');
  };

  const onShare = async (d: SavedDesign) => {
    if (exporting) return;
    setExporting('share');
    try {
      await shareDesign({
        imageBase64: d.imageBase64,
        eventType: d.eventType,
        style: d.style,
        items: d.items,
      });
    } catch (e: any) {
      Alert.alert('Share failed', e?.message || 'Could not share design');
    } finally {
      setExporting(null);
    }
  };

  const onSaveRoll = async (d: SavedDesign) => {
    if (exporting) return;
    setExporting('roll');
    try {
      const msg = await saveDesignToCameraRoll(d.imageBase64);
      Alert.alert('Saved', msg);
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Could not save to camera roll');
    } finally {
      setExporting(null);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Saved designs</Text>
      <FlatList
        data={saved}
        keyExtractor={(d) => d.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No saved designs yet"
            body="Generate a decoration preview and save the ones you love."
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={{ flex: 1 }}>
            <Pressable onPress={() => setSelected(item)} style={[styles.card, Shadow.card]}>
              <Image
                source={{ uri: `data:image/png;base64,${item.imageBase64}` }}
                style={styles.image}
                contentFit="cover"
                transition={250}
              />
              <Pressable
                style={styles.remove}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  actions.removeDesign(item.id);
                  if (selected?.id === item.id) setSelected(null);
                }}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={16} color={C.white} />
              </Pressable>
              <View style={styles.expandHint}>
                <Ionicons name="expand-outline" size={14} color={C.white} />
              </View>
            </Pressable>
            <Text numberOfLines={1} style={styles.caption}>{item.eventType} · {item.style}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </Animated.View>
        )}
      />
      <BottomNavSpacer />

      {/* Fullscreen viewer with edit / camera roll / share */}
      <Modal
        visible={!!selected}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelected(null)}
        statusBarTranslucent
      >
        <View style={styles.viewerRoot}>
          {selected ? (
            <Image
              source={{ uri: `data:image/png;base64,${selected.imageBase64}` }}
              style={styles.viewerImage}
              contentFit="contain"
              transition={200}
            />
          ) : null}

          <View style={[styles.viewerTop, { paddingTop: Math.max(insets.top, 12) }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.viewerTitle} numberOfLines={1}>
                {selected?.eventType} · {selected?.style}
              </Text>
              {selected?.vision ? (
                <Text style={styles.viewerSub} numberOfLines={1}>{selected.vision}</Text>
              ) : null}
            </View>
            <Pressable
              style={styles.viewerIconBtn}
              onPress={() => setSelected(null)}
              hitSlop={10}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
          </View>

          <View style={[styles.viewerActions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Pressable
              style={[styles.actionBtn, styles.actionPrimary]}
              onPress={() => selected && openEdit(selected)}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.actionPrimaryText}>Edit</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.actionSecondary, exporting === 'roll' && { opacity: 0.6 }]}
              onPress={() => selected && onSaveRoll(selected)}
              disabled={!!exporting}
            >
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.actionSecondaryText}>
                {exporting === 'roll' ? 'Saving…' : 'Camera roll'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.actionSecondary, exporting === 'share' && { opacity: 0.6 }]}
              onPress={() => selected && onShare(selected)}
              disabled={!!exporting}
            >
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={styles.actionSecondaryText}>
                {exporting === 'share' ? '…' : 'Share'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  title: { ...Type.hero, color: C.text, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18 },
  grid: { paddingHorizontal: 20, paddingBottom: 20, gap: 16, flexGrow: 1 },
  card: {
    borderRadius: Radii.md, overflow: 'hidden', height: 180, backgroundColor: C.cardMuted,
  },
  image: { flex: 1 },
  remove: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  expandHint: {
    position: 'absolute', bottom: 8, left: 8, width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center',
  },
  caption: { ...Type.body, fontWeight: '600', color: C.text, marginTop: 8 },
  date: { ...Type.caption, color: C.textLight, marginTop: 2 },

  viewerRoot: { flex: 1, backgroundColor: '#000' },
  viewerImage: { flex: 1, width: '100%' },
  viewerTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  viewerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  viewerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  viewerIconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  viewerActions: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  actionBtn: {
    flex: 1, height: 48, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  actionPrimary: { backgroundColor: C.primary },
  actionPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionSecondary: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  actionSecondaryText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});

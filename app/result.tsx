import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/colors';

const variants = [
  { label: 'Modern Royal Wedding', emoji: '💍', bg: '#1A237E' },
  { label: 'Garden Fresh', emoji: '🌿', bg: '#1B4332' },
  { label: 'Midnight Glam', emoji: '✨', bg: '#4A148C' },
];

const items = aiResult
  ? aiResult
      .split('\n')
      .filter((line) => line.trim().startsWith('-') || line.trim().match(/^\d\./))
      .slice(0, 6)
      .map((line) => ({
        label: line.replace(/^[-\d.]\s*/, '').trim(),
        sub: 'Tap to find in local shops',
        emoji: '✨',
      }))
  : [
      { label: 'Gold Tall Centrepiece', sub: 'Used: 24 Pieces', emoji: '🏆' },
      { label: 'Royal Blue Drapes', sub: 'Premium Velvet', emoji: '💙' },
      { label: 'White Rose Bundles', sub: 'Fresh/Artificial Option', emoji: '🌹' },
    ];

const { aiResult, eventType, decorStyle } = useLocalSearchParams<{
  aiResult: string;
  eventType: string;
  decorStyle: string;
}>();

export default function ResultScreen() {
  const router = useRouter();
  const [variant, setVariant] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero preview */}
        <View style={[styles.hero, { backgroundColor: variants[variant].bg }]}>
          {/* Top buttons */}
          <View style={styles.heroTop}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.heroBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.heroTopRight}>
              <TouchableOpacity style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.heroBtn, styles.heartBtn]}>
                <Text style={styles.heroBtnText}>♥</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preview */}
          <View style={styles.heroContent}>
            <Text style={styles.heroEmoji}>{variants[variant].emoji}</Text>
            <Text style={styles.heroTitle}>{variants[variant].label}</Text>
            <Text style={styles.heroSub}>Variant {variant + 1} of 3</Text>
          </View>

          {/* Dots */}
          <View style={styles.heroDots}>
            {variants.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.heroDot,
                  i === variant && styles.heroDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          {/* Design Variants */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DESIGN VARIANTS</Text>
            <TouchableOpacity>
              <Text style={styles.regenerate}>REGENERATE</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.variantsRow}
          >
            {variants.map((v, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.variantThumb,
                  { backgroundColor: v.bg },
                  i === variant && styles.variantThumbActive,
                ]}
                onPress={() => setVariant(i)}
              >
                <Text style={styles.variantThumbEmoji}>{v.emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            {[
              { emoji: '💾', label: 'Save' },
              { emoji: '↗️', label: 'Share' },
              { emoji: '📤', label: 'Send To' },
            ].map((a) => (
              <TouchableOpacity key={a.label} style={styles.actionBtn}>
                <Text style={styles.actionBtnEmoji}>{a.emoji}</Text>
                <Text style={styles.actionBtnLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Items */}
          <Text style={styles.itemsTitle}>ITEMS IN THIS DESIGN</Text>
          <View style={styles.itemsList}>
            {items.map((item, i) => (
              <TouchableOpacity key={i} style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemSub}>{item.sub}</Text>
                </View>
                <Text style={styles.itemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom buttons */}
          <View style={styles.bottomBtns}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => router.push('/shops')}
            >
              <Text style={styles.outlineBtnText}>🏪 Find Shops</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.solidBtn}
              onPress={() => router.push('/decorators')}
            >
              <Text style={styles.solidBtnText}>📋 Book Decorator</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
  },
  hero: {
    height: 320,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTopRight: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    backgroundColor: '#E53935CC',
  },
  heroBtnText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
  },
  heroContent: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.white + 'BB',
  },
  heroDots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white + '55',
  },
  heroDotActive: {
    width: 20,
    backgroundColor: Colors.white,
  },
  body: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  regenerate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  variantsRow: {
    marginBottom: 20,
  },
  variantThumb: {
    width: 90,
    height: 70,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  variantThumbActive: {
    borderColor: Colors.primary,
  },
  variantThumbEmoji: {
    fontSize: 28,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionBtnEmoji: {
    fontSize: 24,
  },
  actionBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  itemsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 14,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 22,
  },
  itemText: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  itemSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  itemArrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
  bottomBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  solidBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  solidBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});

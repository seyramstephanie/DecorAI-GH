import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavSpacer } from '../components/ui/BottomNav';
import { Pill } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { Palette, useColors } from '../lib/theme';
import { api, Notification, Shop } from '../lib/api';
import { session } from '../lib/session';

const RADIUS_OPTIONS = [5, 10, 15, 20, 25];

const timeAgo = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`;
};

// Shop-owner view: FR-18 radius subscription + FR-26 incoming radius alerts
export default function ShopDashboard() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Your shop = the directory entry sharing your account's phone number
    // (demo: kwame@adumblooms.gh / 1234 owns Adum Blooms). Fallback: first shop.
    api.get<Shop[]>('/shops')
      .then((shops) => {
        const mine = shops.find((s) => s.phone === session.user?.phone) ?? shops[0];
        setShop(mine);
        return api.get<Notification[]>(`/notifications?userId=shop-${mine.id}`);
      })
      .then((n) => setAlerts(n.filter((x) => x.type === 'radius')))
      .catch(() => setError(true));
  }, []);

  const setRadius = (radiusKm: number) => {
    if (!shop) return;
    setShop({ ...shop, radiusKm });
    api.patch(`/shops/${shop.id}/radius`, { radiusKm }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.hero}>My shop</Text>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error && <EmptyState icon="cloud-offline-outline" title="Backend offline" body="Start it with: npm run server." />}

        {shop && (
          <>
            <View style={[styles.card, Shadow.card, { padding: 0, overflow: 'hidden' }]}>
              {!!shop.image && <Image source={{ uri: shop.image }} style={styles.shopPhoto} contentFit="cover" transition={250} />}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 }}>
                <View style={styles.shopIcon}><Ionicons name="storefront" size={20} color={C.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{shop.name}</Text>
                  <Text style={styles.meta}>{shop.category} · {shop.area}, {shop.location}</Text>
                </View>
                {shop.verified && <Ionicons name="checkmark-circle" size={18} color={C.success} />}
              </View>
            </View>

            <Text style={styles.section}>Catchment radius</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {RADIUS_OPTIONS.map((km) => (
                <Pill key={km} label={`${km} km`} active={shop.radiusKm === km} onPress={() => setRadius(km)} />
              ))}
            </View>
            <Text style={styles.hint}>
              You’ll be alerted when a client inside this radius searches for items you stock.
            </Text>

            <Text style={styles.section}>My stock</Text>
            <View style={styles.chips}>
              {shop.stock.map((s) => (
                <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
              ))}
            </View>

            <Text style={styles.section}>Incoming alerts</Text>
            {alerts.length === 0 && (
              <EmptyState icon="megaphone-outline" title="No alerts yet"
                body="When a nearby client searches for items you stock, it appears here." />
            )}
            {alerts.map((a) => (
              <View key={a.id} style={[styles.card, Shadow.card, styles.alert]}>
                <View style={styles.alertIcon}><Ionicons name="megaphone-outline" size={17} color={C.primary} /></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[Type.body, { fontWeight: '600', color: C.text }]}>{a.title}</Text>
                  <Text style={[Type.caption, { color: C.textMuted, lineHeight: 17 }]}>{a.body}</Text>
                  <Text style={styles.time}>{timeAgo(a.at)}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
      <BottomNavSpacer />
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  hero: { ...Type.hero, color: C.text, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  body: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: C.card, borderRadius: Radii.md, padding: 16 },
  shopPhoto: { height: 130 },
  shopIcon: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { ...Type.subtitle, color: C.text },
  meta: { ...Type.caption, color: C.textMuted },
  section: { ...Type.subtitle, color: C.text, marginTop: 22, marginBottom: 10 },
  hint: { ...Type.caption, color: C.textLight, marginTop: 10, lineHeight: 17 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: C.accentSoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 11, fontWeight: '600', color: C.primary },
  alert: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  alertIcon: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  time: { fontSize: 10, color: C.textLight, marginTop: 2 },
});

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { api, Decorator, Shop } from '../lib/api';
import { Palette, useColors } from '../lib/theme';

// In-app guidance to a shop or decorator. With EXPO_PUBLIC_GOOGLE_MAPS_API_KEY set,
// the Google Directions API draws the real driving route; without it we show a
// straight line + distance, and "Go" always opens turn-by-turn in Google Maps.
const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

type LatLng = { latitude: number; longitude: number };
type Place = { title: string; subtitle: string; lat: number; lng: number };

// Google encoded-polyline decoder (Directions API overview_polyline)
function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    for (const which of [0, 1] as const) {
      let result = 0, shift = 0, b = 0x20;
      while (b >= 0x20) {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      }
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (which === 0) lat += delta; else lng += delta;
    }
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

const kmBetween = (a: LatLng, b: LatLng) => {
  const R = 6371, d = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(d(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(d(a.latitude)) * Math.cos(d(b.latitude)) * Math.sin(d(b.longitude - a.longitude) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export default function PlaceMap() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: 'shop' | 'decorator' }>();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const mapRef = useRef<MapView>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [me, setMe] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [eta, setEta] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (type === 'shop') {
      api.get<Shop>(`/shops/${id}`).then((s) =>
        setPlace({ title: s.name, subtitle: `${s.area}, ${s.location}`, lat: s.lat, lng: s.lng })).catch(() => {});
    } else {
      api.get<Decorator>(`/decorators/${id}`).then((d) =>
        setPlace({ title: d.businessName, subtitle: d.location, lat: d.lat, lng: d.lng })).catch(() => {});
    }
  }, [id, type]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return setDenied(true);
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMe({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    })();
  }, []);

  const dest: LatLng | null = place ? { latitude: place.lat, longitude: place.lng } : null;

  // Route via Google Directions once both ends are known
  useEffect(() => {
    if (!me || !dest || !MAPS_KEY) return;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${me.latitude},${me.longitude}` +
      `&destination=${dest.latitude},${dest.longitude}&key=${MAPS_KEY}`;
    fetch(url).then((r) => r.json()).then((json) => {
      const leg = json.routes?.[0];
      if (!leg) return;
      setRoute(decodePolyline(leg.overview_polyline.points));
      setEta(leg.legs?.[0] ? `${leg.legs[0].duration.text} · ${leg.legs[0].distance.text}` : null);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.latitude, me?.longitude, dest?.latitude, dest?.longitude]);

  useEffect(() => {
    if (!dest) return;
    const coords = me ? [me, dest] : [dest];
    setTimeout(() => mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, bottom: 160, left: 60, right: 60 }, animated: true,
    }), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.latitude, dest?.latitude]);

  const openExternal = () => dest && Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}&travelmode=driving`,
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title={place?.title ?? 'Directions'} />
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: dest?.latitude ?? 6.6885, longitude: dest?.longitude ?? -1.6244,
            latitudeDelta: 0.08, longitudeDelta: 0.08,
          }}
          showsUserLocation
        >
          {dest && place && (
            <Marker coordinate={dest} title={place.title} description={place.subtitle} pinColor={C.primary} />
          )}
          {route.length > 0 ? (
            <Polyline coordinates={route} strokeWidth={4} strokeColor={C.primary} />
          ) : (me && dest && (
            <Polyline coordinates={[me, dest]} strokeWidth={3} strokeColor={C.primaryLight}
              lineDashPattern={[10, 8]} />
          ))}
        </MapView>

        {/* Info card */}
        <View style={[styles.info, Shadow.float]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle} numberOfLines={1}>{place?.title ?? '…'}</Text>
            <Text style={styles.infoMeta} numberOfLines={1}>
              {eta
                ?? (me && dest && `${kmBetween(me, dest).toFixed(1)} km away`)
                ?? (denied ? 'Location permission denied' : 'Finding your location…')}
              {!MAPS_KEY && me && dest ? ' · straight-line' : ''}
            </Text>
          </View>
          <Pressable style={styles.go} onPress={openExternal}>
            <Ionicons name="navigate" size={16} color={C.onPrimary} />
            <Text style={styles.goText} numberOfLines={1}>Go</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  mapWrap: { flex: 1, marginHorizontal: 16, marginBottom: 16, borderRadius: Radii.lg, overflow: 'hidden' },
  info: {
    position: 'absolute', left: 14, right: 14, bottom: 14, flexDirection: 'row', alignItems: 'center',
    gap: 12, backgroundColor: C.card, borderRadius: Radii.md, padding: 14,
  },
  infoTitle: { ...Type.subtitle, fontSize: 15, color: C.text },
  infoMeta: { ...Type.caption, color: C.textMuted, marginTop: 2 },
  go: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary,
    borderRadius: 21, height: 42, paddingHorizontal: 18,
  },
  goText: { color: C.onPrimary, fontWeight: '700', fontSize: 14 },
});

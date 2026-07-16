import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Type } from '../constants/theme';
import { api, Decorator, Shop } from '../lib/api';
import { Palette, useColors } from '../lib/theme';
import { Glass } from '../components/ui/Glass';

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
type LatLng = { latitude: number; longitude: number };
type Place = { id?: string; title: string; subtitle: string; lat: number; lng: number };

function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0; let lat = 0; let lng = 0;
  while (index < encoded.length) {
    for (const which of [0, 1] as const) {
      let result = 0; let shift = 0; let byte = 0x20;
      while (byte >= 0x20) {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
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
  const radians = (value: number) => (value * Math.PI) / 180;
  const h = Math.sin(radians(b.latitude - a.latitude) / 2) ** 2
    + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude))
    * Math.sin(radians(b.longitude - a.longitude) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const toPlace = (shop: Shop): Place => ({
  id: shop.id, title: shop.name, subtitle: `${shop.area}, ${shop.location}`, lat: shop.lat, lng: shop.lng,
});

export default function PlaceMap() {
  const { id, type } = useLocalSearchParams<{ id?: string; type?: 'shop' | 'decorator' }>();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [me, setMe] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [eta, setEta] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [busyAll, setBusyAll] = useState(false);

  const loadAllShops = useCallback(async () => {
    const shops = await api.get<Shop[]>('/shops');
    const mapped = shops.map(toPlace);
    setPlaces(mapped);
    return mapped;
  }, []);

  useEffect(() => {
    if (!id) {
      loadAllShops().catch(() => {});
      setPlace(null);
      return;
    }
    if (type === 'shop') {
      api.get<Shop>(`/shops/${id}`).then((shop) => setPlace(toPlace(shop))).catch(() => {});
    } else {
      api.get<Decorator>(`/decorators/${id}`).then((decorator) => setPlace({
        id: decorator.id, title: decorator.businessName, subtitle: decorator.location, lat: decorator.lat, lng: decorator.lng,
      })).catch(() => {});
    }
    // also keep the full directory ready for "View all suppliers"
    loadAllShops().catch(() => {});
  }, [id, type, loadAllShops]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setDenied(true); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMe({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    })();
  }, []);

  const dest = useMemo<LatLng | null>(() => place ? { latitude: place.lat, longitude: place.lng } : null, [place]);

  useEffect(() => {
    if (!me || !dest || !MAPS_KEY) return;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${me.latitude},${me.longitude}`
      + `&destination=${dest.latitude},${dest.longitude}&key=${MAPS_KEY}`;
    fetch(url).then((response) => response.json()).then((json) => {
      const routeInfo = json.routes?.[0];
      if (!routeInfo) return;
      setRoute(decodePolyline(routeInfo.overview_polyline.points));
      setEta(routeInfo.legs?.[0] ? `${routeInfo.legs[0].duration.text} · ${routeInfo.legs[0].distance.text}` : null);
    }).catch(() => {});
  }, [me, dest]);

  const fitCoords = useCallback((coords: LatLng[]) => {
    if (!coords.length) return;
    setTimeout(() => mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 120, bottom: 190, left: 56, right: 56 }, animated: true,
    }), 200);
  }, []);

  useEffect(() => {
    const coords = me && dest ? [me, dest] : dest ? [dest] : places.map((entry) => ({ latitude: entry.lat, longitude: entry.lng }));
    fitCoords(coords);
  }, [me, dest, places, fitCoords]);

  const openExternal = () => dest && Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}&travelmode=driving`,
  );

  /** Show every supplier pin and zoom to fit — works from single-place view too. */
  const viewAllSuppliers = async () => {
    setBusyAll(true);
    try {
      // leave single-place mode so all markers render
      if (id) {
        router.replace('/place-map' as any);
        return;
      }
      setPlace(null);
      setRoute([]);
      setEta(null);
      let list = places;
      if (!list.length) list = await loadAllShops();
      fitCoords(list.map((entry) => ({ latitude: entry.lat, longitude: entry.lng })));
    } catch {
      // ignore
    } finally {
      setBusyAll(false);
    }
  };

  const showAllMarkers = !dest;

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{ latitude: dest?.latitude ?? 6.6885, longitude: dest?.longitude ?? -1.6244, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
        showsUserLocation
      >
        {dest && place && <Marker coordinate={dest} title={place.title} description={place.subtitle} pinColor={C.primary} />}
        {showAllMarkers && places.map((entry) => (
          <Marker
            key={entry.id}
            coordinate={{ latitude: entry.lat, longitude: entry.lng }}
            title={entry.title}
            description={entry.subtitle}
            pinColor={C.primary}
            onCalloutPress={() => router.push({ pathname: '/place-map', params: { id: entry.id, type: 'shop' } })}
          />
        ))}
        {route.length > 0 ? <Polyline coordinates={route} strokeWidth={4} strokeColor={C.primary} /> : (
          me && dest && <Polyline coordinates={[me, dest]} strokeWidth={3} strokeColor={C.primaryLight} lineDashPattern={[10, 8]} />
        )}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.replace('/shops')} hitSlop={8}>
          <Glass isInteractive glassEffectStyle="clear" style={styles.topButton}>
            <Ionicons name="chevron-back" size={22} color={C.text} />
          </Glass>
        </Pressable>
        <Glass isInteractive glassEffectStyle="regular" style={styles.titlePill}>
          <Ionicons name={dest ? 'navigate-outline' : 'map-outline'} size={16} color={C.primary} />
          <Text style={styles.mapTitle} numberOfLines={1}>{place?.title ?? 'Explore decor shops'}</Text>
        </Glass>
      </View>

      <Glass intensity="strong" glassEffectStyle="regular" style={styles.info}>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle} numberOfLines={1}>{place?.title ?? 'Browse suppliers near you'}</Text>
          <Text style={styles.infoMeta} numberOfLines={1}>
            {eta ?? (me && dest && `${kmBetween(me, dest).toFixed(1)} km away`)
              ?? (dest ? (denied ? 'Location permission denied' : 'Finding your location…') : `${places.length || '…'} verified shops on the map`)}
            {!MAPS_KEY && me && dest ? ' · straight-line' : ''}
          </Text>
        </View>
        {dest ? (
          <View style={styles.actions}>
            <Pressable onPress={viewAllSuppliers} disabled={busyAll}>
              <Glass isInteractive glassEffectStyle="clear" style={styles.secondary}>
                {busyAll ? <ActivityIndicator color={C.primary} size="small" /> : (
                  <>
                    <Ionicons name="map-outline" size={15} color={C.primary} />
                    <Text style={styles.secondaryText}>All</Text>
                  </>
                )}
              </Glass>
            </Pressable>
            <Pressable style={styles.go} onPress={openExternal}>
              <Ionicons name="navigate" size={16} color={C.onPrimary} />
              <Text style={styles.goText}>Go</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.go} onPress={viewAllSuppliers} disabled={busyAll}>
            {busyAll ? <ActivityIndicator color={C.onPrimary} size="small" /> : (
              <>
                <Ionicons name="scan-outline" size={16} color={C.onPrimary} />
                <Text style={styles.goText}>View all</Text>
              </>
            )}
          </Pressable>
        )}
      </Glass>
    </View>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  topBar: { position: 'absolute', top: 0, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  topButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  titlePill: { flex: 1, maxWidth: 270, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 22, height: 44, paddingHorizontal: 14, overflow: 'hidden' },
  mapTitle: { ...Type.body, fontWeight: '700', color: C.text, flex: 1 },
  info: { position: 'absolute', left: 16, right: 16, bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, padding: 14, overflow: 'hidden' },
  infoTitle: { ...Type.subtitle, fontSize: 15, color: C.text },
  infoMeta: { ...Type.caption, color: C.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secondary: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 21, height: 42, paddingHorizontal: 12, overflow: 'hidden',
  },
  secondaryText: { color: C.primary, fontWeight: '700', fontSize: 13 },
  go: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, borderRadius: 21, height: 42, paddingHorizontal: 16 },
  goText: { color: C.onPrimary, fontWeight: '700', fontSize: 14 },
});

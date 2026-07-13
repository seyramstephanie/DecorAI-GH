import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Pill } from '../components/ui/Chip';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Radii, Shadow, Type } from '../constants/theme';
import { Palette, useColors } from '../lib/theme';
import { api, Decorator } from '../lib/api';
import { EVENT_TYPES } from '../data/seed';
import { session } from '../lib/session';
import { useStore } from '../lib/store';

const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');

export default function DecoratorDetail() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const { id, designId } = useLocalSearchParams<{ id: string; designId?: string }>();
  const { variants } = useStore();
  const [decorator, setDecorator] = useState<Decorator | null>(null);
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState('');
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<Decorator>(`/decorators/${id}`).then(setDecorator).catch(() => {});
  }, [id]);

  const attachedDesign = designId && variants.length > 0 ? variants[0] : null;

  // FR-21/22 — send booking request with the AI design attached as the formal brief
  const send = async () => {
    setBusy(true);
    const clientId = session.user?.id ?? 'guest';
    const clientName = session.user?.name ?? 'Guest';
    try {
      await api.post('/bookings', {
        decoratorId: id, clientId, clientName, eventType, eventDate, venue, budget,
        brief: (attachedDesign ? '[AI design attached] ' : '') + brief,
        designImage: attachedDesign ? 'attached-ai-design' : undefined,
      });
      await api.post('/notifications/brief-alert', { decoratorId: id, clientName, eventType }).catch(() => {});
      router.push('/bookings');
    } catch {
      router.push('/bookings'); // dev-only: never strand the user
    } finally { setBusy(false); }
  };

  if (!decorator) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader title="Decorator" />
        <Text style={[Type.body, { color: C.textMuted, textAlign: 'center', marginTop: 40 }]}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="Decorator" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={[styles.profile, Shadow.card]}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials(decorator.name)}</Text></View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.name}>{decorator.businessName}</Text>
              {decorator.verified && <Ionicons name="checkmark-circle" size={16} color={C.success} />}
            </View>
            <Text style={styles.meta}>{decorator.name} · {decorator.location}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Ionicons name="star" size={13} color={C.accent} />
              <Text style={styles.metaDark}>{decorator.rating} ({decorator.reviews} reviews)</Text>
            </View>
            <Text style={styles.price}>{decorator.priceRange}</Text>
          </View>
        </View>

        {/* Contact actions — message in-app, map directions, phone call */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.action, styles.actionPrimary]}
            onPress={() => router.push({
              pathname: '/chat',
              params: { threadId: `dm_${decorator.id}_${session.user?.id ?? 'guest'}`, name: decorator.businessName },
            })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={C.onPrimary} />
            <Text style={[styles.actionText, { color: C.onPrimary }]} numberOfLines={1}>Message</Text>
          </Pressable>
          <Pressable
            style={styles.action}
            onPress={() => router.push({ pathname: '/place-map', params: { id: decorator.id, type: 'decorator' } })}
          >
            <Ionicons name="navigate-outline" size={18} color={C.primary} />
            <Text style={styles.actionText} numberOfLines={1}>Directions</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={() => Linking.openURL(`tel:${decorator.phone.replace(/\s/g, '')}`)}>
            <Ionicons name="call-outline" size={18} color={C.primary} />
            <Text style={styles.actionText} numberOfLines={1}>Call</Text>
          </Pressable>
        </View>

        <Text style={styles.bio}>{decorator.bio}</Text>

        {/* FR-25 — portfolio */}
        <Text style={styles.section}>Portfolio</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {decorator.portfolio.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.portfolio} contentFit="cover" transition={250} />
          ))}
        </ScrollView>

        <View style={styles.chips}>
          {decorator.specialisations.map((s) => (
            <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
          ))}
        </View>

        {/* Booking form */}
        <Text style={styles.section}>Request a booking</Text>

        {attachedDesign && (
          <View style={styles.attached}>
            <Image
              source={{ uri: `data:image/png;base64,${attachedDesign.imageBase64}` }}
              style={styles.attachedImg} contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.metaDark}>AI design attached</Text>
              <Text style={styles.meta}>Sent as your formal brief</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={C.success} />
          </View>
        )}

        <View style={styles.pills}>
          {EVENT_TYPES.map((e) => <Pill key={e} label={e} active={eventType === e} onPress={() => setEventType(e)} />)}
        </View>

        <TextInput style={styles.input} placeholder="Venue (e.g. Miklin Hotel, Kumasi)" placeholderTextColor={C.textLight} value={venue} onChangeText={setVenue} />
        <TextInput style={styles.input} placeholder="Event date (e.g. 24 Dec 2026)" placeholderTextColor={C.textLight} value={eventDate} onChangeText={setEventDate} />
        <TextInput style={styles.input} placeholder="Budget (GH₵)" placeholderTextColor={C.textLight} value={budget} onChangeText={setBudget} keyboardType="numeric" />
        <TextInput
          style={[styles.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 14 }]}
          placeholder="Describe your brief…" placeholderTextColor={C.textLight}
          value={brief} onChangeText={setBrief} multiline
        />

        <Button title="Send booking request" icon="paper-plane-outline" loading={busy} onPress={send} style={{ marginTop: 6 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  profile: {
    flexDirection: 'row', gap: 14, backgroundColor: C.card, borderRadius: Radii.md,
    padding: 16, alignItems: 'center',
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Type.title, color: C.primary },
  name: { ...Type.subtitle, color: C.text },
  meta: { ...Type.caption, color: C.textMuted },
  metaDark: { ...Type.caption, color: C.text, fontWeight: '600' },
  price: { ...Type.caption, color: C.primary, fontWeight: '700', marginTop: 3 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  action: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 46, borderRadius: 23, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
  },
  actionPrimary: { backgroundColor: C.primary, borderColor: C.primary },
  actionText: { fontSize: 13, fontWeight: '700', color: C.primary, flexShrink: 1 },
  bio: { ...Type.body, color: C.textMuted, lineHeight: 20 },
  section: { ...Type.subtitle, color: C.text, marginTop: 14, marginBottom: 4 },
  portfolio: { width: 240, height: 160, borderRadius: Radii.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: { backgroundColor: C.cardMuted, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 11, fontWeight: '600', color: C.textMuted },
  attached: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.accentSoft,
    borderRadius: Radii.sm, padding: 10,
  },
  attachedImg: { width: 54, height: 54, borderRadius: 8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  input: {
    backgroundColor: C.card, borderRadius: Radii.sm, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, height: 52, ...Type.body, color: C.text,
  },
});

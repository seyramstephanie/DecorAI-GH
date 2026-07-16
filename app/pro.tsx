import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/Glass';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Radii, Type } from '../constants/theme';
import { api, BillingInit } from '../lib/api';
import { session, User } from '../lib/session';
import { Palette, useColors } from '../lib/theme';

const PERKS = [
  { icon: 'sparkles' as const, title: 'Decorate with AI', body: 'Upload a room photo and generate styled previews.' },
  { icon: 'images' as const, title: 'Structure-safe designs', body: 'Gemini pipeline keeps walls and layout consistent.' },
  { icon: 'chatbubbles' as const, title: 'Still free to message', body: 'Free users can browse shops & text decorators anytime.' },
];

/** Paystack Pro unlock — paste PAYSTACK_SECRET_KEY in root .env on the API. */
export default function Pro() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const user = session.user;
  const [busy, setBusy] = useState(false);

  const unlock = async () => {
    if (!user) {
      router.push('/create-account');
      return;
    }
    if (session.canUseAi()) {
      router.replace('/generate');
      return;
    }
    setBusy(true);
    try {
      const init = await api.post<BillingInit>('/billing/initialize', { userId: user.id });
      if (init.mock || init.authorizationUrl.startsWith('decorai://')) {
        const updated = await api.post<User>('/billing/verify', { reference: init.reference });
        session.set(updated);
        Alert.alert('Pro unlocked', 'Dev mode (no Paystack key) — AI decorate is ready for 30 days.');
        router.replace('/generate');
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(init.authorizationUrl, Linking.createURL('billing/callback'));
      // After Paystack redirects or user closes browser, verify the reference.
      if (result.type === 'success' || result.type === 'dismiss') {
        const updated = await api.post<User>('/billing/verify', { reference: init.reference });
        session.set(updated);
        Alert.alert('Welcome to Pro', 'Decorate with AI is unlocked.');
        router.replace('/generate');
      }
    } catch (e: unknown) {
      const msg = String((e as Error).message);
      if (msg.includes('402') || msg.includes('PAYMENT')) {
        Alert.alert('Payment incomplete', 'Finish Paystack checkout, then try Verify again.');
      } else {
        Alert.alert('Billing error', msg);
      }
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="DecorAI Pro" />
      <View style={styles.body}>
        <GlassCard style={styles.hero}>
          <View style={styles.badge}>
            <Ionicons name="diamond" size={18} color={C.onPrimary} />
            <Text style={styles.badgeText}>PRO</Text>
          </View>
          <Text style={styles.price}>GH₵50 / month</Text>
          <Text style={styles.lead}>
            Free accounts browse shops, hire decorators, and chat. Pro unlocks Decorate with AI.
          </Text>
        </GlassCard>

        {PERKS.map((p) => (
          <View key={p.title} style={styles.perk}>
            <View style={styles.perkIcon}><Ionicons name={p.icon} size={20} color={C.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.perkTitle}>{p.title}</Text>
              <Text style={styles.perkBody}>{p.body}</Text>
            </View>
          </View>
        ))}

        <Button
          title={session.canUseAi() ? 'Open Decorate with AI' : 'Upgrade with Paystack'}
          loading={busy}
          onPress={unlock}
          style={{ marginTop: 20, borderRadius: 28 }}
        />
        <Text style={styles.note}>
          Paste PAYSTACK_SECRET_KEY in .env. Without it, checkout uses a safe local mock for development.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 20, paddingBottom: 32 },
  hero: { padding: 20, marginBottom: 18, borderRadius: Radii.lg },
  badge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  badgeText: { color: C.onPrimary, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  price: { ...Type.hero, color: C.text, marginTop: 14 },
  lead: { ...Type.body, color: C.textMuted, marginTop: 8, lineHeight: 20 },
  perk: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  perkIcon: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  perkTitle: { ...Type.subtitle, color: C.text, fontSize: 15 },
  perkBody: { ...Type.caption, color: C.textMuted, marginTop: 2, lineHeight: 16 },
  note: { ...Type.caption, color: C.textLight, textAlign: 'center', marginTop: 14, lineHeight: 16 },
});

import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useState, useSyncExternalStore } from 'react';
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

function formatExpiry(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

/** Paystack Pro unlock — secret key stays on the API only. */
export default function Pro() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  // Re-render when session updates after payment
  const user = useSyncExternalStore(session.subscribe, () => session.user);
  const isPro = session.canUseAi();
  const [busy, setBusy] = useState(false);
  const expiry = formatExpiry(user?.planExpiresAt);

  const unlock = async () => {
    if (!user) {
      router.push('/create-account');
      return;
    }
    if (isPro) {
      router.replace('/generate');
      return;
    }
    setBusy(true);
    try {
      const init = await api.post<BillingInit>('/billing/initialize', { userId: user.id });
      if (init.mock || init.authorizationUrl.startsWith('decorai://') || init.authorizationUrl.startsWith('decoraigh://')) {
        const updated = await api.post<User>('/billing/verify', { reference: init.reference });
        session.set(updated);
        Alert.alert('Pro activated', 'You are on DecorAI GH Pro for 30 days. Decorate with AI is unlocked.');
        return;
      }

      // Real Paystack checkout. Free ngrok may show a "Visit Site" warning first — tap through it.
      const returnUrl = Linking.createURL('billing/callback');
      await WebBrowser.openAuthSessionAsync(init.authorizationUrl, returnUrl);

      // Always verify after the browser closes (callback also verifies on the server)
      try {
        const updated = await api.post<User>('/billing/verify', { reference: init.reference });
        session.set(updated);
        Alert.alert(
          "You're on Pro!",
          'Payment successful. Decorate with AI is unlocked for 30 days.',
        );
      } catch {
        // Payment may still be processing — refresh user if API already unlocked via callback
        try {
          const status = await api.get<{ isPro?: boolean; plan?: string; planExpiresAt?: string | null; canUseAi?: boolean }>(
            `/billing/status?userId=${encodeURIComponent(user.id)}`,
          );
          if (status.isPro || status.canUseAi || status.plan === 'pro') {
            session.set({
              ...user,
              plan: (status.plan as User['plan']) || 'pro',
              planExpiresAt: status.planExpiresAt,
              isPro: true,
              canUseAi: true,
            });
            Alert.alert("You're on Pro!", 'Payment confirmed. Decorate with AI is unlocked for 30 days.');
            return;
          }
        } catch {
          // ignore
        }
        Alert.alert(
          'Confirming payment',
          'If you finished Paystack checkout, wait a few seconds and tap “I’ve paid — confirm Pro” below.',
        );
      }
    } catch (e: unknown) {
      const msg = String((e as Error).message);
      if (msg.includes('402') || msg.includes('PAYMENT')) {
        Alert.alert('Payment incomplete', 'Finish Paystack checkout, then confirm below.');
      } else {
        Alert.alert('Billing error', msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const confirmPaid = async () => {
    if (!user) return;
    setBusy(true);
    try {
      // status endpoint is enough if callback already unlocked; otherwise user may need last reference
      const status = await api.get<{ isPro?: boolean; plan?: string; planExpiresAt?: string | null; canUseAi?: boolean }>(
        `/billing/status?userId=${encodeURIComponent(user.id)}`,
      );
      if (status.isPro || status.canUseAi || status.plan === 'pro') {
        session.set({
          ...user,
          plan: (status.plan as User['plan']) || 'pro',
          planExpiresAt: status.planExpiresAt,
          isPro: true,
          canUseAi: true,
        });
        Alert.alert("You're on Pro!", 'Your Pro plan is active.');
      } else {
        Alert.alert(
          'Not active yet',
          'We have not confirmed a successful payment. Complete Paystack checkout, and if you see an ngrok page tap “Visit Site”, then try again.',
        );
      }
    } catch (e: unknown) {
      Alert.alert('Could not confirm', String((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="DecorAI Pro" />
      <View style={styles.body}>
        <GlassCard style={styles.hero}>
          <View style={[styles.badge, isPro && styles.badgeActive]}>
            <Ionicons name="diamond" size={18} color={C.onPrimary} />
            <Text style={styles.badgeText}>{isPro ? 'ACTIVE PRO' : 'PRO'}</Text>
          </View>

          {isPro ? (
            <>
              <Text style={styles.price}>You&apos;re on Pro</Text>
              <Text style={styles.lead}>
                Payment received. Decorate with AI is unlocked
                {expiry ? ` until ${expiry}` : ' for this billing period'}.
              </Text>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={18} color={C.primary} />
                <Text style={styles.statusText}>Plan: Pro · AI decorate enabled</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.price}>GH₵50 / month</Text>
              <Text style={styles.lead}>
                Free accounts browse shops, hire decorators, and chat. Pro unlocks Decorate with AI.
              </Text>
            </>
          )}
        </GlassCard>

        {PERKS.map((p) => (
          <View key={p.title} style={styles.perk}>
            <View style={styles.perkIcon}>
              <Ionicons name={p.icon} size={20} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.perkTitle}>{p.title}</Text>
              <Text style={styles.perkBody}>{p.body}</Text>
            </View>
          </View>
        ))}

        <Button
          title={isPro ? 'Start decorating with AI' : 'Upgrade with Paystack'}
          loading={busy}
          onPress={unlock}
          style={{ marginTop: 20, borderRadius: 28 }}
        />

        {!isPro && (
          <Button
            title="I've paid — confirm Pro"
            variant="ghost"
            loading={busy}
            onPress={confirmPaid}
            style={{ marginTop: 10, borderRadius: 28 }}
          />
        )}

        {isPro ? (
          <Text style={styles.note}>
            Thank you for upgrading. You can manage your account anytime from Profile.
          </Text>
        ) : (
          <Text style={styles.note}>
            After Paystack, if a browser warning mentions ngrok, tap Visit Site — that is the free tunnel safety page, not a scam. You will then see DecorAI&apos;s payment success screen.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    body: { paddingHorizontal: 20, paddingBottom: 32 },
    hero: { padding: 20, marginBottom: 18, borderRadius: Radii.lg },
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeActive: { backgroundColor: '#2D6A4F' },
    badgeText: { color: C.onPrimary, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
    price: { ...Type.hero, color: C.text, marginTop: 14 },
    lead: { ...Type.body, color: C.textMuted, marginTop: 8, lineHeight: 20 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
    statusText: { ...Type.caption, color: C.primary, fontWeight: '700' },
    perk: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
    perkIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: C.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    perkTitle: { ...Type.subtitle, color: C.text, fontSize: 15 },
    perkBody: { ...Type.caption, color: C.textMuted, marginTop: 2, lineHeight: 16 },
    note: { ...Type.caption, color: C.textLight, textAlign: 'center', marginTop: 14, lineHeight: 16 },
  });

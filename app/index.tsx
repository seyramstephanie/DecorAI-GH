import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandLogo } from '../components/ui/BrandLogo';
import { hydrateSession, session, type User } from '../lib/session';
import { hydrateStore } from '../lib/store';
import { useColors } from '../lib/theme';

void SplashScreen.preventAutoHideAsync().catch(() => {});

const MIN_LOGO_MS = 1400;

/**
 * First screen for everyone: Decor AI logo, then route by restored session.
 * Uses the hydrate return value (not a racey subscription) so login always sticks.
 */
export default function Index() {
  const C = useColors();
  const [boot, setBoot] = useState<{ done: boolean; user: User | null }>({
    done: false,
    user: null,
  });

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    (async () => {
      let user: User | null = null;
      try {
        const [restored] = await Promise.all([hydrateSession(), hydrateStore()]);
        user = restored ?? session.user;
      } catch (e) {
        console.warn('[boot] hydrate error', e);
        user = session.user;
      }

      const wait = Math.max(0, MIN_LOGO_MS - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));

      if (!cancelled) {
        setBoot({ done: true, user });
        SplashScreen.hideAsync().catch(() => {});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!boot.done) {
    // Full-screen page bg only — logo itself has no box / fill behind it
    return (
      <View style={[styles.boot, { backgroundColor: C.bg }]}>
        <BrandLogo size={168} />
      </View>
    );
  }

  const user = boot.user;
  if (!user) return <Redirect href="/onboarding" />;
  if (user.role === 'decorator') return <Redirect href="/decorator-dashboard" />;
  if (user.role === 'shop') return <Redirect href="/shop-dashboard" />;
  if (user.role === 'admin') return <Redirect href={'/admin' as any} />;
  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

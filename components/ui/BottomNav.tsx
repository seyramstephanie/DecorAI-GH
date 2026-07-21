import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useMemo, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { session } from '../../lib/session';
import { Palette, useColors } from '../../lib/theme';
import { Glass } from './Glass';

const TABS_BY_ROLE = {
  client: [
    { route: '/home', icon: 'home-outline', activeIcon: 'home' },
    { route: '/shops', icon: 'cart-outline', activeIcon: 'cart' },
    { route: '/saved', icon: 'heart-outline', activeIcon: 'heart' },
    { route: '/profile', icon: 'person-outline', activeIcon: 'person' },
  ],
  decorator: [
    { route: '/decorator-dashboard', icon: 'color-palette-outline', activeIcon: 'color-palette' },
    { route: '/messages', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
    { route: '/notification', icon: 'notifications-outline', activeIcon: 'notifications' },
    { route: '/profile', icon: 'person-outline', activeIcon: 'person' },
  ],
  shop: [
    { route: '/shop-dashboard', icon: 'storefront-outline', activeIcon: 'storefront' },
    { route: '/shops', icon: 'cart-outline', activeIcon: 'cart' },
    { route: '/messages', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
    { route: '/profile', icon: 'person-outline', activeIcon: 'person' },
  ],
  admin: [
    { route: '/admin', icon: 'clipboard-outline', activeIcon: 'clipboard' },
    { route: '/decorators', icon: 'people-outline', activeIcon: 'people' },
    { route: '/notification', icon: 'notifications-outline', activeIcon: 'notifications' },
    { route: '/profile', icon: 'person-outline', activeIcon: 'person' },
  ],
} as const;

/** Icon bar height (48) + vertical padding (10+10). */
const BAR_HEIGHT = 68;
const WRAP_TOP = 4;

function useBottomNavHeight() {
  const insets = useSafeAreaInsets();
  return WRAP_TOP + BAR_HEIGHT + Math.max(insets.bottom - 4, 6);
}

/** Invisible spacer so page content clears the fixed bottom nav (only when nav is visible). */
export function BottomNavSpacer() {
  const pathname = usePathname();
  const user = useSyncExternalStore(session.subscribe, () => session.user);
  const tabs = TABS_BY_ROLE[user?.role ?? 'client'];
  const isTabRoute = tabs.some((tab) => tab.route === pathname);
  const height = useBottomNavHeight();
  if (!isTabRoute) return null;
  return <View style={{ height }} pointerEvents="none" />;
}

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const user = useSyncExternalStore(session.subscribe, () => session.user);
  const tabs = TABS_BY_ROLE[user?.role ?? 'client'];
  const isTabRoute = tabs.some((tab) => tab.route === pathname);

  // Fixed outside the stack so it never slides with page transitions.
  if (!isTabRoute) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom - 4, 6) }]}
    >
      <Glass isInteractive glassEffectStyle="regular" style={styles.bar}>
        {tabs.map((tab) => {
          const active = pathname === tab.route;
          return (
            <Pressable
              key={tab.route}
              onPress={() => router.replace(tab.route as any)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Ionicons
                name={(active ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={active ? C.onPrimary : C.textLight}
              />
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
    paddingHorizontal: 12,
    paddingTop: WRAP_TOP,
  },
  bar: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingTop: 10, paddingBottom: 10, paddingHorizontal: 12,
    borderRadius: 28, overflow: 'hidden',
  },
  tab: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: C.primary },
});

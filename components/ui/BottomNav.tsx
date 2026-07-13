import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useMemo, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shadow } from '../../constants/theme';
import { session } from '../../lib/session';
import { Palette, useColors } from '../../lib/theme';

// Bottom nav per UI reference: active tab is a filled circle, others are line icons.
// Tabs adapt to the signed-in role — clients browse, decorators run their studio,
// shop owners run their shop.
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
} as const;

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const user = useSyncExternalStore(session.subscribe, () => session.user);
  const tabs = TABS_BY_ROLE[user?.role ?? 'client'];

  return (
    <View style={[styles.bar, Shadow.float, { paddingBottom: Math.max(insets.bottom - 6, 8) }]}>
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
    </View>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  bar: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: C.card, paddingTop: 10, paddingHorizontal: 12,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  tab: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: C.primary },
});

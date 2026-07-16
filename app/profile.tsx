import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useSyncExternalStore } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/ui/BottomNav';
import { GlassCard, GlassToggleRow } from '../components/ui/Glass';
import { Radii, Type } from '../constants/theme';
import { Role, session } from '../lib/session';
import { actions, useStore } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

const ROLE_LABELS: Record<Role, string> = {
  client: 'Client',
  decorator: 'Decorator',
  shop: 'Shop owner',
  admin: 'Admin',
};

export default function Profile() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const user = useSyncExternalStore(session.subscribe, () => session.user);
  const { prefs } = useStore();
  const isPro = session.canUseAi();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/home')} style={styles.circleBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable onPress={() => router.push('/account-settings')} style={styles.circleBtn} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={18} color={C.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.push('/account-settings')}>
          <GlassCard isInteractive style={styles.profileCard}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}><Ionicons name="person" size={26} color={C.primary} /></View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
              <Text style={styles.meta}>{user?.email || 'Add your details'}</Text>
              <Text style={styles.planTag}>{isPro ? 'Pro · AI unlocked' : 'Free · Browse & chat'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textLight} />
          </GlassCard>
        </Pressable>

        <GlassCard style={styles.group}>
          <GlassToggleRow
            label="Dark Mode"
            value={prefs.darkMode}
            onValueChange={(v) => actions.setPref('darkMode', v)}
          />
          <GlassToggleRow
            label="Notifications"
            value={prefs.notifications}
            onValueChange={(v) => actions.setPref('notifications', v)}
            last
          />
        </GlassCard>

        <GlassCard style={styles.group}>
          {(() => {
            const role = user?.role;
            const hasBookings = role === 'client';
            const hasUpgrade = role === 'client' && !isPro;
            const hasProRow = role === 'client' && isPro;
            const hasShop = role === 'shop';
            const hasDecorator = role === 'decorator';
            const hasAdmin = role === 'admin';
            const hasExtra = hasBookings || hasUpgrade || hasProRow || hasShop || hasDecorator || hasAdmin;
            return (
              <>
                <Row label="Messages" onPress={() => router.push('/messages')} chevron />
                <Row
                  label="Account Settings"
                  onPress={() => router.push('/account-settings')}
                  chevron
                  last={!hasExtra}
                />
                {hasBookings && (
                  <Row
                    label="My Bookings"
                    onPress={() => router.push('/bookings')}
                    chevron
                    last={!hasUpgrade && !hasProRow && !hasShop && !hasDecorator && !hasAdmin}
                  />
                )}
                {hasUpgrade && (
                  <Row label="Upgrade to Pro" value="AI" onPress={() => router.push('/pro' as any)} chevron last />
                )}
                {hasProRow && (
                  <Row
                    label="Pro plan"
                    value="Active"
                    onPress={() => router.push('/pro' as any)}
                    chevron
                    last={!hasShop && !hasDecorator && !hasAdmin}
                  />
                )}
                {hasShop && (
                  <Row label="My Shop Dashboard" onPress={() => router.push('/shop-dashboard')} chevron last />
                )}
                {hasDecorator && (
                  <Row label="My Decorator Studio" onPress={() => router.push('/decorator-dashboard')} chevron last />
                )}
                {hasAdmin && (
                  <Row label="Admin console" onPress={() => router.push('/admin' as any)} chevron last />
                )}
              </>
            );
          })()}
        </GlassCard>

        <GlassCard style={styles.group}>
          <Row label="Account type" value={ROLE_LABELS[user?.role ?? 'client']} />
          <Row label="Saved Designs" onPress={() => router.push('/saved')} chevron />
          <Row label="Help & Support" onPress={() => router.push('/notification')} chevron />
          <Row
            label="Log Out" danger chevron last
            onPress={() => { session.set(null); router.replace('/onboarding'); }}
          />
        </GlassCard>
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

function Row({ label, value, chevron, danger, last, onPress, children }: {
  label: string; value?: string; chevron?: boolean; danger?: boolean; last?: boolean;
  onPress?: () => void; children?: React.ReactNode;
}) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, !last && styles.rowBorder]}>
      <Text style={[styles.rowLabel, danger && { color: C.danger }]}>{label}</Text>
      {value != null && <Text style={styles.rowValue}>{value}</Text>}
      {children}
      {chevron && <Ionicons name="chevron-forward" size={17} color={danger ? C.danger : C.textLight} />}
    </Pressable>
  );
}

const makeStyles = (C: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.cardMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...Type.title, color: C.text },
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  avatar: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: 54, height: 54, borderRadius: 27 },
  name: { ...Type.subtitle, color: C.text },
  meta: { ...Type.caption, color: C.textMuted, marginTop: 2 },
  planTag: { ...Type.caption, color: C.primary, fontWeight: '700', marginTop: 4 },
  group: { paddingHorizontal: 16, paddingBottom: 4, borderRadius: Radii.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 15, minHeight: 54 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  rowLabel: { ...Type.body, fontSize: 15, fontWeight: '600', color: C.text, flex: 1 },
  rowValue: { ...Type.body, fontSize: 14, color: C.textMuted },
});

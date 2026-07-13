import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useSyncExternalStore } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '../components/ui/BottomNav';
import { Radii, Shadow, Type } from '../constants/theme';
import { Role, session } from '../lib/session';
import { actions, useStore } from '../lib/store';
import { Palette, useColors } from '../lib/theme';

// Profile per settings UI reference: circular header buttons, profile card,
// grouped rows (toggles + chevrons), red Log Out — in our system colors.
const ROLE_LABELS: Record<Role, string> = { client: 'Client', decorator: 'Decorator', shop: 'Shop owner' };
const NEXT_ROLE: Record<Role, Role> = { client: 'decorator', decorator: 'shop', shop: 'client' };

export default function Profile() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const user = useSyncExternalStore(session.subscribe, () => session.user);
  const { prefs } = useStore();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header — circular back + menu buttons, centered title */}
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
        {/* Profile card — avatar, name, email, chevron */}
        <Pressable onPress={() => router.push('/account-settings')} style={[styles.card, Shadow.card, styles.profileCard]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}><Ionicons name="person" size={26} color={C.primary} /></View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
            <Text style={styles.meta}>{user?.email || 'Add your details'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.textLight} />
        </Pressable>

        {/* Group 1 — toggles + account rows */}
        <View style={[styles.card, Shadow.card, styles.group]}>
          <Row label="Dark Mode">
            <Switch
              value={prefs.darkMode}
              onValueChange={(v) => actions.setPref('darkMode', v)}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor={C.white}
            />
          </Row>
          <Row label="Notifications">
            <Switch
              value={prefs.notifications}
              onValueChange={(v) => actions.setPref('notifications', v)}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor={C.white}
            />
          </Row>
          <Row label="Messages" onPress={() => router.push('/messages')} chevron />
          <Row label="Account Settings" onPress={() => router.push('/account-settings')} chevron />
          <Row label="My Bookings" onPress={() => router.push('/bookings')} chevron last={user?.role !== 'shop'} />
          {user?.role === 'shop' && (
            <Row label="My Shop Dashboard" onPress={() => router.push('/shop-dashboard')} chevron last />
          )}
        </View>

        {/* Group 2 — preferences + sign out */}
        <View style={[styles.card, Shadow.card, styles.group]}>
          <Row
            label="Role"
            value={ROLE_LABELS[user?.role ?? 'client']}
            onPress={() => user && session.set({ ...user, role: NEXT_ROLE[user.role] })}
            chevron
          />
          <Row label="Saved Designs" onPress={() => router.push('/saved')} chevron />
          <Row label="Help & Support" onPress={() => router.push('/notification')} chevron />
          <Row
            label="Log Out" danger chevron last
            onPress={() => { session.set(null); router.replace('/onboarding'); }}
          />
        </View>
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
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  card: { backgroundColor: C.card, borderRadius: Radii.lg },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  avatar: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: 54, height: 54, borderRadius: 27 },
  name: { ...Type.subtitle, color: C.text },
  meta: { ...Type.caption, color: C.textMuted, marginTop: 2 },
  group: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 15, minHeight: 54 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  rowLabel: { ...Type.body, fontSize: 15, fontWeight: '600', color: C.text, flex: 1 },
  rowValue: { ...Type.body, fontSize: 14, color: C.textMuted },
});

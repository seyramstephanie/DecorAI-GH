import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

const savedDesigns = [
  { label: 'Kente Fusion', emoji: '🏠', bg: '#1B4332' },
  { label: 'Akan Minimalist', emoji: '🛋️', bg: '#2D3748' },
];

const recentBookings = [
  {
    id: 1,
    title: 'Ghanaian Heritage Fusion',
    date: 'OCT 12, 2024',
    status: 'In Progress',
    statusColor: Colors.accent,
    statusTextColor: Colors.primary,
    emoji: '🏠',
    bg: '#E8F5E9',
  },
  {
    id: 2,
    title: 'Office Revamp',
    date: 'AUG 24, 2024',
    status: 'Completed',
    statusColor: Colors.green100,
    statusTextColor: Colors.primary,
    emoji: '🏢',
    bg: '#EFF6FF',
  },
];

const settingsItems = [
  { emoji: '👤', label: 'Account Settings', nav: '/account-settings' },
  { emoji: '🔔', label: 'Notifications', nav: '/notification' },
  { emoji: '❓', label: 'Help & Support', nav: null },
];
export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Green header */}
        <View style={styles.headerBg}>
          {/* Top nav */}
          <View style={styles.headerNav}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.headerBtnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarArea}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>👩🏽</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            </View>
            <Text style={styles.profileName}>Ama Serwaa</Text>
            <Text style={styles.profileLocation}>📍 Accra, Ghana</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { value: '12', label: 'DESIGNS' },
              { value: '4', label: 'BOOKINGS' },
              { value: '340', label: 'CREDITS' },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          {/* Saved Designs */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Designs</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.designsRow}
            contentContainerStyle={{ gap: 12 }}
          >
            {savedDesigns.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.designCard, { backgroundColor: d.bg }]}
              >
                <Text style={styles.designEmoji}>{d.emoji}</Text>
                <View style={styles.designLabelArea}>
                  <Text style={styles.designLabel}>{d.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recent Bookings */}
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <View style={styles.bookingsList}>
            {recentBookings.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.bookingCard}
                onPress={() => router.push('/bookings')}
              >
                <View style={[styles.bookingThumb, { backgroundColor: b.bg }]}>
                  <Text style={styles.bookingEmoji}>{b.emoji}</Text>
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTitle}>{b.title}</Text>
                  <Text style={styles.bookingDate}>{b.date}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: b.statusColor },
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: b.statusTextColor },
                  ]}>
                    {b.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Settings */}
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          <View style={styles.settingsList}>
            {settingsItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.settingsItem,
                  i < settingsItems.length - 1 && styles.settingsItemBorder,
                ]}
                onPress={() => item.nav && router.push(item.nav as any)}
              >
                <View style={styles.settingsLeft}>
                  <Text style={styles.settingsEmoji}>{item.emoji}</Text>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                </View>
                <Text style={styles.settingsArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Log out */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.logoutEmoji}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { emoji: '🏠', label: 'Home', nav: '/home' },
          { emoji: '🪄', label: 'Designs', nav: '/generate' },
          { emoji: '🏪', label: 'Shops', nav: '/shops' },
          { emoji: '👤', label: 'Profile', nav: '/profile', active: true },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={styles.tabItem}
            onPress={() => router.push(tab.nav as any)}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text style={[
              styles.tabLabel,
              tab.active && styles.tabLabelActive,
            ]}>
              {tab.label}
            </Text>
            {tab.active && <View style={styles.tabDot} />}
          </TouchableOpacity>
        ))}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/generate')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
  },
  headerBg: {
    backgroundColor: Colors.primary,
    paddingBottom: 28,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 18,
    color: Colors.white,
  },
  avatarArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 13,
    color: Colors.green200,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.white + '15',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.green200,
    letterSpacing: 0.5,
  },
  body: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
    marginTop: 8,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  designsRow: {
    marginBottom: 24,
  },
  designCard: {
    width: 150,
    height: 110,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  designEmoji: {
    fontSize: 36,
  },
  designLabelArea: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  designLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    textShadowColor: '#00000066',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bookingsList: {
    gap: 12,
    marginBottom: 24,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bookingEmoji: {
    fontSize: 24,
  },
  bookingInfo: {
    flex: 1,
    gap: 4,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  bookingDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  settingsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsEmoji: {
    fontSize: 20,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    backgroundColor: Colors.bg,
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  settingsArrow: {
    fontSize: 22,
    color: Colors.textLight,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutEmoji: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.red,
  },
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textLight,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.white,
    lineHeight: 32,
  },
});
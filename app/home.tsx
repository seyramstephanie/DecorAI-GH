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

const quickActions = [
  { emoji: '📷', label: 'Upload Space', sub: 'Photo analysis', bg: '#F0FDF4' },
  { emoji: '🪄', label: 'Generate Design', sub: 'AI visualization', bg: '#FFF9E6' },
  { emoji: '🎨', label: 'Find Decorators', sub: 'Local experts', bg: '#F0FDF4' },
  { emoji: '🛋️', label: 'Browse Shops', sub: 'Furniture & Decor', bg: '#FFF9E6' },
];

const recentDesigns = [
  { label: 'Living Room v2', time: '2 hours ago', tag: 'SCANDI', bg: '#E8F5E9' },
  { label: 'Workspace Draft', time: 'Yesterday', tag: 'OFFICE', bg: '#E3F2FD' },
];

const inspirations = [
  { label: 'Garden Wedding', emoji: '💐', bg: '#1B4332', size: 'large' },
  { label: 'Earth Tone Dining', emoji: '🪴', bg: '#8B6914', size: 'small' },
  { label: 'Afro-Modern', emoji: '🎋', bg: '#2D6A4F', size: 'small' },
  { label: 'Poolside Lounge', emoji: '🌴', bg: '#1565C0', size: 'small' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👨🏾</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.name}>Kwame</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* AI Banner */}
        <TouchableOpacity
          style={styles.banner}
          onPress={() => router.push('/generate')}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>
              Transform your{'\n'}space with AI
            </Text>
            <Text style={styles.bannerSub}>
              Starting from just ₵20 per design
            </Text>
            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>TRY NOW</Text>
            </View>
          </View>
          <View style={styles.bannerImageArea}>
            <Text style={styles.bannerEmoji}>🛋️</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, { backgroundColor: action.bg }]}
              onPress={() => {
                if (i === 1) router.push('/generate');
                if (i === 2) router.push('/decorators');
                if (i === 3) router.push('/shops');
              }}
            >
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionSub}>{action.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Designs */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>RECENT DESIGNS</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.designsRow}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {recentDesigns.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.designCard, { backgroundColor: d.bg }]}
            >
              <View style={styles.designTag}>
                <Text style={styles.designTagText}>{d.tag}</Text>
              </View>
              <Text style={styles.designEmoji}>🏠</Text>
              <Text style={styles.designLabel}>{d.label}</Text>
              <Text style={styles.designTime}>{d.time}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Inspiration */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>INSPIRATION</Text>
          <View style={styles.inspirationTabs}>
            <TouchableOpacity style={styles.inspirationTabActive}>
              <Text style={styles.inspirationTabActiveText}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inspirationTab}>
              <Text style={styles.inspirationTabText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inspirationGrid}>
          <TouchableOpacity
            style={[styles.inspirationLarge, { backgroundColor: inspirations[0].bg }]}
          >
            <Text style={styles.inspirationEmoji}>{inspirations[0].emoji}</Text>
            <View style={styles.inspirationLabel}>
              <Text style={styles.inspirationLabelText}>{inspirations[0].label}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.inspirationCol}>
            {inspirations.slice(1).map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.inspirationSmall, { backgroundColor: item.bg }]}
              >
                <Text style={styles.inspirationEmojiSmall}>{item.emoji}</Text>
                <View style={styles.inspirationLabel}>
                  <Text style={styles.inspirationLabelText}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { emoji: '🏠', label: 'Home', nav: '/home', active: true },
          { emoji: '🪄', label: 'Designs', nav: '/generate', active: false },
          { emoji: '🏪', label: 'Shops', nav: '/shops', active: false },
          { emoji: '👤', label: 'Profile', nav: '/profile', active: false },
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

        {/* Centre FAB */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  notifIcon: {
    fontSize: 20,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  banner: {
    marginHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
    lineHeight: 26,
  },
  bannerSub: {
    fontSize: 13,
    color: Colors.green200,
    marginBottom: 16,
  },
  bannerBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  bannerImageArea: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerEmoji: {
    fontSize: 56,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 8,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  actionSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  designsRow: {
    marginBottom: 24,
  },
  designCard: {
    width: 160,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  designTag: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  designTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  designEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  designLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  designTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  inspirationTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  inspirationTabActive: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  inspirationTabActiveText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  inspirationTab: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inspirationTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  inspirationGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  inspirationLarge: {
    flex: 1,
    height: 280,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inspirationEmoji: {
    fontSize: 48,
  },
  inspirationEmojiSmall: {
    fontSize: 32,
  },
  inspirationCol: {
    flex: 1,
    gap: 12,
  },
  inspirationSmall: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inspirationLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  inspirationLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    textShadowColor: '#00000066',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
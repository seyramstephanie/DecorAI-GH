import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '../constants/colors';

const decorators = [
  {
    id: 1,
    name: 'Serwaa Mensah',
    specialty: 'Wedding Expert',
    specialtyColor: '#E8F5E9',
    specialtyTextColor: Colors.primary,
    area: 'Cantonments, Accra',
    rating: 4.9,
    reviews: 124,
    emoji: '👩🏾',
    portfolioEmojis: ['💍', '🌿', '🎊', '🏛️'],
    bg: '#F0FDF4',
  },
  {
    id: 2,
    name: 'Kofi Amoako',
    specialty: 'Modern Home',
    specialtyColor: '#E3F2FD',
    specialtyTextColor: '#1565C0',
    area: 'East Legon, Accra',
    rating: 4.7,
    reviews: 89,
    emoji: '👨🏿',
    portfolioEmojis: ['🏠', '🛋️', '🪴', '💡'],
    bg: '#EFF6FF',
  },
  {
    id: 3,
    name: 'Abena Forson',
    specialty: 'Corporate Events',
    specialtyColor: '#F3E8FF',
    specialtyTextColor: '#7C3AED',
    area: 'Airport City, Accra',
    rating: 5.0,
    reviews: 42,
    emoji: '👩🏽',
    portfolioEmojis: ['🏢', '🎤', '💼', '✨'],
    bg: '#FDF4FF',
  },
  {
    id: 4,
    name: 'Kwame Asante',
    specialty: 'Funeral & Church',
    specialtyColor: '#FFF7ED',
    specialtyTextColor: '#C2410C',
    area: 'Kumasi, Ashanti',
    rating: 4.8,
    reviews: 67,
    emoji: '👨🏾',
    portfolioEmojis: ['⛪', '🕊️', '🌸', '🕯️'],
    bg: '#FFF7ED',
  },
];

const filterBtns = ['Location', 'Price Range', 'Event Type'];

export default function DecoratorsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = decorators.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Decorator Directory</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <Text style={styles.notifIcon}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for experts, styles..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        {filterBtns.map((f) => (
          <TouchableOpacity key={f} style={styles.filterChip}>
            <Text style={styles.filterChipText}>{f} ▾</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Count row */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            <Text style={styles.countNum}>42</Text>
            {' '}PROFESSIONALS FOUND
          </Text>
          <TouchableOpacity style={styles.sortBtn}>
            <Text style={styles.sortText}>Sort By ↕</Text>
          </TouchableOpacity>
        </View>

        {/* Decorator cards */}
        <View style={styles.cardsList}>
          {filtered.map((dec) => (
            <View key={dec.id} style={styles.card}>

              {/* Top row */}
              <View style={styles.cardTop}>
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: dec.bg }]}>
                  <Text style={styles.avatarEmoji}>{dec.emoji}</Text>
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <View style={styles.cardInfoTop}>
                    <Text style={styles.decName}>{dec.name}</Text>
                    <View style={[
                      styles.specialtyBadge,
                      { backgroundColor: dec.specialtyColor },
                    ]}>
                      <Text style={[
                        styles.specialtyText,
                        { color: dec.specialtyTextColor },
                      ]}>
                        {dec.specialty}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.ratingNum}>{dec.rating}</Text>
                    <Text style={styles.ratingCount}>
                      ({dec.reviews} reviews)
                    </Text>
                  </View>
                  <Text style={styles.area}>📍 {dec.area}</Text>
                </View>
              </View>

              {/* Portfolio strip */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.portfolioRow}
                contentContainerStyle={{ gap: 8 }}
              >
                {dec.portfolioEmojis.map((emoji, i) => (
                  <View
                    key={i}
                    style={[styles.portfolioThumb, { backgroundColor: dec.bg }]}
                  >
                    <Text style={styles.portfolioEmoji}>{emoji}</Text>
                  </View>
                ))}
                <View style={styles.portfolioMore}>
                  <Text style={styles.portfolioMoreText}>+{dec.reviews}</Text>
                </View>
              </ScrollView>

              {/* View Profile button */}
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push({
                    pathname: '/chat',
                    params: {
                        name: dec.name,
                        emoji: dec.emoji,
                        specialty: dec.specialty,
                        area: dec.area,
                    },
                    })}
              >
                <Text style={styles.profileBtnText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { emoji: '🏠', label: 'Home', nav: '/home' },
          { emoji: '👥', label: 'Directory', nav: '/decorators', active: true },
          { emoji: '🪄', label: 'Design', nav: '/generate' },
          { emoji: '🏪', label: 'Shops', nav: '/shops' },
          { emoji: '👤', label: 'Profile', nav: '/profile' },
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  backArrow: {
    fontSize: 16,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  notifIcon: {
    fontSize: 18,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 11,
  },
  filtersRow: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  container: {
    flex: 1,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  countNum: {
    color: Colors.primary,
    fontWeight: '800',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  decName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  specialtyBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 13,
  },
  ratingNum: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  area: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  portfolioRow: {
    marginBottom: 14,
  },
  portfolioThumb: {
    width: 80,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portfolioEmoji: {
    fontSize: 32,
  },
  portfolioMore: {
    width: 80,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  portfolioMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  profileBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  profileBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
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
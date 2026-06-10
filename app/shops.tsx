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

const shops = [
  {
    id: 1,
    name: 'Elite Decor Ghana',
    area: 'Osu, Accra',
    closes: 'Closes 6:00 PM',
    distance: '1.2 km',
    rating: 4.9,
    isOpen: true,
    matchingItems: ['Gold Centrepieces', 'Velvet Drapes'],
    emoji: '🏆',
    bg: '#FFF9E6',
  },
  {
    id: 2,
    name: 'Accra Event Hub',
    area: 'Spintex Road',
    closes: 'Closes 8:00 PM',
    distance: '2.8 km',
    rating: 4.7,
    isOpen: true,
    matchingItems: ['Floral Bundles', 'Crystal Lighting'],
    emoji: '💡',
    bg: '#E8F5E9',
  },
  {
    id: 3,
    name: 'The Vases & More',
    area: 'East Legon',
    closes: 'Opens Mon 9:00 AM',
    distance: '4.1 km',
    rating: 4.5,
    isOpen: false,
    matchingItems: ['Glass Vases', 'Table Runners'],
    emoji: '🌸',
    bg: '#FCE4EC',
  },
  {
    id: 4,
    name: 'Kumasi Floral World',
    area: 'Adum, Kumasi',
    closes: 'Closes 7:00 PM',
    distance: '5.3 km',
    rating: 4.8,
    isOpen: true,
    matchingItems: ['White Rose Arches', 'Chiffon Drapes'],
    emoji: '🌹',
    bg: '#F3E5F5',
  },
];

const filters = ['Distance', 'Price', 'Rating', 'Open Now'];

export default function ShopsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [activeFilter, setActiveFilter] = useState('Distance');

  const filtered = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
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
        <Text style={styles.headerTitle}>Shop Discovery</Text>

        {/* List / Map toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewBtn, view === 'list' && styles.viewBtnActive]}
            onPress={() => setView('list')}
          >
            <Text style={[
              styles.viewBtnText,
              view === 'list' && styles.viewBtnTextActive,
            ]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewBtn, view === 'map' && styles.viewBtnActive]}
            onPress={() => setView('map')}
          >
            <Text style={[
              styles.viewBtnText,
              view === 'map' && styles.viewBtnTextActive,
            ]}>
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for shops or items..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
      >
        <TouchableOpacity style={styles.filterMain}>
          <Text style={styles.filterMainText}>≡ Filters</Text>
        </TouchableOpacity>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              activeFilter === f && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[
              styles.filterChipText,
              activeFilter === f && styles.filterChipTextActive,
            ]}>
              {f} ▾
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Match banner */}
        <View style={styles.matchBanner}>
          <View style={[styles.matchDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.matchText}>
            Found{' '}
            <Text style={styles.matchCount}>12 shops</Text>
            {' '}near you that stock items from your{' '}
            <Text style={styles.matchLink}>Royal Wedding</Text>
            {' '}design.
          </Text>
        </View>

        {/* Shop cards */}
        <View style={styles.shopsList}>
          {filtered.map((shop) => (
            <View key={shop.id} style={styles.shopCard}>

              {/* Image area */}
              <View style={[styles.shopImage, { backgroundColor: shop.bg }]}>
                <Text style={styles.shopImageEmoji}>{shop.emoji}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingStar}>⭐</Text>
                  <Text style={styles.ratingText}>{shop.rating}</Text>
                </View>
                {!shop.isOpen && (
                  <View style={styles.closedOverlay}>
                    <Text style={styles.closedText}>CLOSED UNTIL MONDAY</Text>
                  </View>
                )}
              </View>

              {/* Shop info */}
              <View style={styles.shopInfo}>
                <View style={styles.shopInfoTop}>
                  <View>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <Text style={styles.shopArea}>
                      {shop.area} • {shop.closes}
                    </Text>
                  </View>
                  <Text style={styles.shopDistance}>📍 {shop.distance}</Text>
                </View>

                {/* Matching items */}
                <View style={styles.matchingItems}>
                  <Text style={styles.matchingLabel}>MATCHING ITEMS</Text>
                  <View style={styles.matchingChips}>
                    {shop.matchingItems.map((item) => (
                      <View key={item} style={styles.matchingChip}>
                        <Text style={styles.matchingChipText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.shopBtns}>
                  <TouchableOpacity
                    style={[
                      styles.contactBtn,
                      !shop.isOpen && styles.contactBtnDisabled,
                    ]}
                    disabled={!shop.isOpen}
                  >
                    <Text style={styles.contactBtnText}>
                      📞 Contact Shop
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareBtn}>
                    <Text style={styles.shareBtnText}>↗</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { emoji: '🏠', label: 'Home', nav: '/home' },
          { emoji: '🪄', label: 'Generate', nav: '/generate' },
          { emoji: '🏪', label: 'Shops', nav: '/shops', active: true },
          { emoji: '🔖', label: 'Saved', nav: '/home' },
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewBtnActive: {
    backgroundColor: Colors.primary,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  viewBtnTextActive: {
    color: Colors.white,
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
  filterMain: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  filterChip: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.green100,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  matchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
    flexShrink: 0,
  },
  matchText: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 20,
  },
  matchCount: {
    fontWeight: '700',
    color: Colors.primary,
  },
  matchLink: {
    fontWeight: '700',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  shopsList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  shopCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  shopImage: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shopImageEmoji: {
    fontSize: 64,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingStar: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  closedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white + 'EE',
    padding: 10,
    alignItems: 'center',
  },
  closedText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.red,
    letterSpacing: 0.5,
  },
  shopInfo: {
    padding: 16,
  },
  shopInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  shopArea: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  shopDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  matchingItems: {
    marginBottom: 14,
  },
  matchingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  matchingChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  matchingChip: {
    backgroundColor: Colors.bg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matchingChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  shopBtns: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  contactBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  contactBtnDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 10,
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
});
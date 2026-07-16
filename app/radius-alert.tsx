import { useRouter } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../constants/colors";

const radiusOptions = [
  {
    km: 5,
    label: "5 km",
    desc: "Immediate neighbourhood",
    price: "GHS 50/month",
  },
  {
    km: 10,
    label: "10 km",
    desc: "Local area coverage",
    price: "GHS 80/month",
  },
  {
    km: 20,
    label: "20 km",
    desc: "City-wide coverage",
    price: "GHS 120/month",
  },
  { km: 50, label: "50 km", desc: "Regional coverage", price: "GHS 150/month" },
];

const categories = [
  { id: 1, label: "Florist", emoji: "🌸" },
  { id: 2, label: "Fabric & Drapes", emoji: "🪡" },
  { id: 3, label: "Lighting", emoji: "💡" },
  { id: 4, label: "Balloons", emoji: "🎈" },
  { id: 5, label: "Furniture", emoji: "🪑" },
  { id: 6, label: "Centrepieces", emoji: "🌿" },
];

export default function RadiusAlertScreen() {
  const router = useRouter();
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState([1]);
  const [saved, setSaved] = useState(false);

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Radius Alert Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoEmoji}>📍</Text>
          <Text style={styles.infoText}>
            Get notified instantly when a client near you searches for items you
            stock.
          </Text>
        </View>

        {/* Radius Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT YOUR CATCHMENT RADIUS</Text>
          {radiusOptions.map((option) => (
            <TouchableOpacity
              key={option.km}
              style={[
                styles.radiusCard,
                selectedRadius === option.km && styles.radiusCardActive,
              ]}
              onPress={() => setSelectedRadius(option.km)}
            >
              <View style={styles.radiusLeft}>
                <View
                  style={[
                    styles.radio,
                    selectedRadius === option.km && styles.radioActive,
                  ]}
                >
                  {selectedRadius === option.km && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View>
                  <Text
                    style={[
                      styles.radiusLabel,
                      selectedRadius === option.km && styles.radiusLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.radiusDesc}>{option.desc}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.radiusPrice,
                  selectedRadius === option.km && styles.radiusPriceActive,
                ]}
              >
                {option.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stock Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR STOCK CATEGORIES</Text>
          <Text style={styles.sectionSubtitle}>Select what items you sell</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(cat.id) &&
                    styles.categoryChipActive,
                ]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategories.includes(cat.id) &&
                      styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUBSCRIPTION SUMMARY</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Coverage radius</Text>
              <Text style={styles.summaryValue}>{selectedRadius} km</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Categories selected</Text>
              <Text style={styles.summaryValue}>
                {selectedCategories.length}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monthly cost</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                {radiusOptions.find((r) => r.km === selectedRadius)?.price}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.savedBtn]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>
            {saved ? "✓ Settings Saved!" : "Activate Radius Alerts"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { fontSize: 18, color: Colors.text },
  headerTitle: { fontSize: 17, fontWeight: "800", color: Colors.text },
  container: { flex: 1 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    margin: 20,
    padding: 16,
    backgroundColor: Colors.accentSoft,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoEmoji: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
    marginTop: -8,
  },
  radiusCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radiusCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentSoft,
  },
  radiusLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: Colors.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radiusLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  radiusLabelActive: { color: Colors.primary },
  radiusDesc: { fontSize: 12, color: Colors.textMuted },
  radiusPrice: { fontSize: 13, fontWeight: "600", color: Colors.textMuted },
  radiusPriceActive: { color: Colors.primary },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.primary,
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: 13, fontWeight: "500", color: Colors.textMuted },
  categoryLabelActive: { color: Colors.primary, fontWeight: "700" },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  summaryLabel: { fontSize: 14, color: Colors.textMuted },
  summaryValue: { fontSize: 14, fontWeight: "700", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  bottomBar: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  savedBtn: { backgroundColor: Colors.accent },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: Colors.white },
});

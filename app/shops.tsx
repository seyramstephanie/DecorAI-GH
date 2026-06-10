import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const shops = [
  {
    id: "1",
    name: "Kumasi Floral Hub",
    category: "Florist",
    location: "Kumasi",
    rating: 4.8,
    distance: "1.2 km",
    open: true,
    items: "Fresh flowers, wreaths, bouquets",
  },
  {
    id: "2",
    name: "GoldCoast Fabrics",
    category: "Fabric & Drapes",
    location: "Accra",
    rating: 4.6,
    distance: "3.5 km",
    open: true,
    items: "Kente, velvet, chiffon drapes",
  },
  {
    id: "3",
    name: "Bright Lights Rental",
    category: "Lighting",
    location: "Kumasi",
    rating: 4.7,
    distance: "2.1 km",
    open: false,
    items: "LED lights, chandeliers, fairy lights",
  },
  {
    id: "4",
    name: "Balloon Paradise",
    category: "Balloons",
    location: "Takoradi",
    rating: 4.5,
    distance: "0.8 km",
    open: true,
    items: "Latex, foil, arch balloons",
  },
  {
    id: "5",
    name: "Elegant Furniture",
    category: "Furniture",
    location: "Accra",
    rating: 4.9,
    distance: "4.2 km",
    open: true,
    items: "Chairs, tables, centrepieces",
  },
];

export default function ShopDirectory() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All");
  const categories = [
    "All",
    "Florist",
    "Fabric & Drapes",
    "Lighting",
    "Balloons",
    "Furniture",
  ];

  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (selected === "All" || s.category === selected),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Decor Shops</Text>

      <TextInput
        style={styles.search}
        placeholder="Search shops..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, selected === c && styles.chipActive]}
            onPress={() => setSelected(c)}
          >
            <Text
              style={[styles.chipText, selected === c && styles.chipTextActive]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((s) => (
          <View key={s.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>🏪</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.name}>{s.name}</Text>
                  <Text style={s.open ? styles.open : styles.closed}>
                    {s.open ? "Open" : "Closed"}
                  </Text>
                </View>
                <Text style={styles.category}>{s.category}</Text>
                <View style={styles.row}>
                  <Text style={styles.location}>📍 {s.location}</Text>
                  <Text style={styles.distance}>{s.distance}</Text>
                </View>
                <Text style={styles.rating}>⭐ {s.rating}</Text>
              </View>
            </View>
            <Text style={styles.items}>🛍️ {s.items}</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>View Shop</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 16,
  },
  search: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterRow: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  chipActive: { backgroundColor: "#1B4332", borderColor: "#1B4332" },
  chipText: { color: "#666", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", marginBottom: 10 },
  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 26 },
  info: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 15, fontWeight: "bold", color: "#1B4332" },
  open: {
    fontSize: 11,
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  closed: {
    fontSize: 11,
    color: "#c62828",
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  category: { color: "#666", fontSize: 12, marginTop: 2 },
  location: { color: "#888", fontSize: 12, marginTop: 2 },
  distance: { color: "#1B4332", fontSize: 12, fontWeight: "600" },
  rating: { fontSize: 13, color: "#f57f17", marginTop: 4 },
  items: {
    fontSize: 12,
    color: "#555",
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#1B4332",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

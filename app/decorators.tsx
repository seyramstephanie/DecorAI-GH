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

const decorators = [
  {
    id: "1",
    name: "Akosua Mensah",
    specialty: "Weddings & Events",
    location: "Kumasi",
    rating: 4.8,
    price: "GHS 500–1500",
    available: true,
  },
  {
    id: "2",
    name: "Kwame Asante",
    specialty: "Corporate & Church",
    location: "Accra",
    rating: 4.6,
    price: "GHS 300–1000",
    available: true,
  },
  {
    id: "3",
    name: "Abena Owusu",
    specialty: "Funerals & Home",
    location: "Kumasi",
    rating: 4.9,
    price: "GHS 400–1200",
    available: false,
  },
  {
    id: "4",
    name: "Yaw Boateng",
    specialty: "Weddings & Birthdays",
    location: "Takoradi",
    rating: 4.7,
    price: "GHS 600–2000",
    available: true,
  },
];

export default function DecoratorDirectory() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All");
  const filters = ["All", "Weddings", "Corporate", "Funerals", "Church"];

  const filtered = decorators.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      (selected === "All" || d.specialty.includes(selected)),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Find a Decorator</Text>

      <TextInput
        style={styles.search}
        placeholder="Search decorators..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, selected === f && styles.chipActive]}
            onPress={() => setSelected(f)}
          >
            <Text
              style={[styles.chipText, selected === f && styles.chipTextActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((d) => (
          <View key={d.id} style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{d.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.row}>
                <Text style={styles.name}>{d.name}</Text>
                <Text
                  style={d.available ? styles.available : styles.unavailable}
                >
                  {d.available ? "Available" : "Busy"}
                </Text>
              </View>
              <Text style={styles.specialty}>{d.specialty}</Text>
              <Text style={styles.location}>📍 {d.location}</Text>
              <View style={styles.row}>
                <Text style={styles.rating}>⭐ {d.rating}</Text>
                <Text style={styles.price}>{d.price}</Text>
              </View>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
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
    alignSelf: "flex-start",
  },
  chipActive: { backgroundColor: "#1B4332", borderColor: "#1B4332" },
  chipText: { color: "#666", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    elevation: 2,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "#1B4332",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  info: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#1B4332" },
  available: {
    fontSize: 11,
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unavailable: {
    fontSize: 11,
    color: "#c62828",
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  specialty: { color: "#666", fontSize: 13, marginTop: 2 },
  location: { color: "#888", fontSize: 12, marginTop: 2 },
  rating: { fontSize: 13, color: "#f57f17", marginTop: 4 },
  price: { fontSize: 12, color: "#888", marginTop: 4 },
  button: {
    backgroundColor: "#1B4332",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

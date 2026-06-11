import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const alerts = [
  {
    id: "1",
    client: "Ama Serwaa",
    items: "Fresh flowers, wreaths",
    location: "Kumasi",
    distance: "1.2 km",
    time: "5 mins ago",
    read: false,
  },
  {
    id: "2",
    client: "Kofi Mensah",
    items: "Balloon arch, latex balloons",
    location: "Kumasi",
    distance: "2.8 km",
    time: "20 mins ago",
    read: false,
  },
  {
    id: "3",
    client: "Abena Asante",
    items: "Floral centrepieces",
    location: "Kumasi",
    distance: "0.5 km",
    time: "1 hour ago",
    read: true,
  },
];

const stock = [
  {
    id: "1",
    name: "Fresh Rose Bundles",
    quantity: 45,
    unit: "bundles",
    status: "good",
  },
  {
    id: "2",
    name: "White Lilies",
    quantity: 12,
    unit: "bundles",
    status: "low",
  },
  {
    id: "3",
    name: "Floral Wreaths",
    quantity: 8,
    unit: "pieces",
    status: "low",
  },
  {
    id: "4",
    name: "Dried Flowers",
    quantity: 60,
    unit: "packs",
    status: "good",
  },
];

export default function ShopDashboard() {
  const [radius, setRadius] = useState(5);
  const [alertList, setAlertList] = useState(alerts);
  const [activeTab, setActiveTab] = useState("alerts");

  const unread = alertList.filter((a) => !a.read).length;

  const markRead = (id: string) => {
    setAlertList(
      alertList.map((a) => (a.id === id ? { ...a, read: true } : a)),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Shop Dashboard</Text>
      <Text style={styles.shopName}>Kumasi Floral Hub</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{unread}</Text>
          <Text style={styles.statLabel}>New Alerts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>24</Text>
          <Text style={styles.statLabel}>Views Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>8</Text>
          <Text style={styles.statLabel}>Enquiries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>⭐4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Radius Setting */}
      <View style={styles.radiusCard}>
        <Text style={styles.radiusTitle}>📍 Alert Radius</Text>
        <Text style={styles.radiusValue}>{radius} km</Text>
        <View style={styles.radiusBtns}>
          {[2, 5, 10, 20].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusBtn, radius === r && styles.radiusBtnActive]}
              onPress={() => setRadius(r)}
            >
              <Text
                style={[
                  styles.radiusBtnText,
                  radius === r && styles.radiusBtnTextActive,
                ]}
              >
                {r}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "alerts" && styles.tabActive]}
          onPress={() => setActiveTab("alerts")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "alerts" && styles.tabTextActive,
            ]}
          >
            Alerts {unread > 0 && `(${unread})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "stock" && styles.tabActive]}
          onPress={() => setActiveTab("stock")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "stock" && styles.tabTextActive,
            ]}
          >
            Stock
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === "alerts" && (
          <View>
            {alertList.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.alertCard, !a.read && styles.alertCardUnread]}
                onPress={() => markRead(a.id)}
              >
                <View style={styles.alertTop}>
                  <Text style={styles.alertClient}>👤 {a.client}</Text>
                  <Text style={styles.alertTime}>{a.time}</Text>
                </View>
                <Text style={styles.alertItems}>🛍️ {a.items}</Text>
                <View style={styles.alertBottom}>
                  <Text style={styles.alertLocation}>
                    📍 {a.location} · {a.distance}
                  </Text>
                  <TouchableOpacity style={styles.respondBtn}>
                    <Text style={styles.respondBtnText}>Respond</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === "stock" && (
          <View>
            {stock.map((s) => (
              <View key={s.id} style={styles.stockCard}>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockName}>{s.name}</Text>
                  <Text style={styles.stockQty}>
                    {s.quantity} {s.unit}
                  </Text>
                </View>
                <View
                  style={[
                    styles.stockBadge,
                    s.status === "low" ? styles.badgeLow : styles.badgeGood,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {s.status === "low" ? "Low Stock" : "In Stock"}
                  </Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addStockBtn}>
              <Text style={styles.addStockText}>+ Update Stock</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", color: "#1B4332" },
  shopName: { fontSize: 14, color: "#666", marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    elevation: 1,
  },
  statNum: { fontSize: 18, fontWeight: "bold", color: "#1B4332" },
  statLabel: { fontSize: 10, color: "#888", marginTop: 2, textAlign: "center" },
  radiusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  radiusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 4,
  },
  radiusValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 12,
  },
  radiusBtns: { flexDirection: "row", gap: 8 },
  radiusBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  radiusBtnActive: { backgroundColor: "#1B4332", borderColor: "#1B4332" },
  radiusBtnText: { fontSize: 13, color: "#666", fontWeight: "600" },
  radiusBtnTextActive: { color: "#fff" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, padding: 10, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#1B4332" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#fff" },
  alertCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  alertCardUnread: { borderLeftWidth: 4, borderLeftColor: "#1B4332" },
  alertTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  alertClient: { fontSize: 14, fontWeight: "bold", color: "#1B4332" },
  alertTime: { fontSize: 11, color: "#999" },
  alertItems: { fontSize: 13, color: "#555", marginBottom: 8 },
  alertBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertLocation: { fontSize: 12, color: "#888" },
  respondBtn: {
    backgroundColor: "#1B4332",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  respondBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  stockCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  stockInfo: { flex: 1 },
  stockName: { fontSize: 14, fontWeight: "600", color: "#333" },
  stockQty: { fontSize: 12, color: "#888", marginTop: 2 },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeGood: { backgroundColor: "#E8F5E9" },
  badgeLow: { backgroundColor: "#FFF3E0" },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#1B4332" },
  addStockBtn: {
    backgroundColor: "#1B4332",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  addStockText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

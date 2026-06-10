import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const notifs = [
  {
    id: "1",
    type: "booking",
    title: "Booking Confirmed!",
    message:
      "Akosua Mensah confirmed your wedding decoration booking for 25 Dec 2026.",
    time: "2 mins ago",
    read: false,
    emoji: "✅",
  },
  {
    id: "2",
    type: "shop",
    title: "Shop Alert",
    message:
      "Kumasi Floral Hub has fresh flowers matching your AI design in stock!",
    time: "15 mins ago",
    read: false,
    emoji: "🏪",
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "Akosua Mensah sent you a message about your decoration brief.",
    time: "1 hour ago",
    read: false,
    emoji: "💬",
  },
  {
    id: "4",
    type: "reminder",
    title: "Event Reminder",
    message:
      "Your wedding decoration is in 48 hours! Contact your decorator to confirm final details.",
    time: "2 hours ago",
    read: true,
    emoji: "⏰",
  },
  {
    id: "5",
    type: "inspiration",
    title: "Weekly Inspiration",
    message:
      "New Ghanaian wedding decoration styles are available. Check out this week's top designs!",
    time: "1 day ago",
    read: true,
    emoji: "✨",
  },
  {
    id: "6",
    type: "shop",
    title: "Stock Update",
    message:
      "Bright Lights Rental now has LED chandeliers you shortlisted back in stock!",
    time: "2 days ago",
    read: true,
    emoji: "💡",
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(notifs);
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Bookings", "Shops", "Messages"];

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Bookings")
      return n.type === "booking" || n.type === "reminder";
    if (filter === "Shops") return n.type === "shop";
    if (filter === "Messages") return n.type === "message";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[styles.chipText, filter === f && styles.chipTextActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.card, !n.read && styles.cardUnread]}
            onPress={() => markRead(n.id)}
          >
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>{n.emoji}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.row}>
                <Text style={styles.title}>{n.title}</Text>
                {!n.read && <View style={styles.dot} />}
              </View>
              <Text style={styles.message}>{n.message}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  header: { fontSize: 24, fontWeight: "bold", color: "#1B4332" },
  unreadCount: { fontSize: 12, color: "#666", marginTop: 2 },
  markAll: { fontSize: 13, color: "#1B4332", fontWeight: "600", marginTop: 6 },
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
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    elevation: 1,
  },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: "#1B4332" },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 14, fontWeight: "bold", color: "#1B4332", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#1B4332" },
  message: { fontSize: 13, color: "#555", marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, color: "#999", marginTop: 6 },
});

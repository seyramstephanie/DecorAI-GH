import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const initialMessages = [
  {
    id: "1",
    sender: "decorator",
    text: "Hello! I received your decoration brief. The AI design looks amazing!",
    time: "10:00 AM",
  },
  {
    id: "2",
    sender: "client",
    text: "Thank you! Can you replicate it exactly for my wedding on 25th December?",
    time: "10:02 AM",
  },
  {
    id: "3",
    sender: "decorator",
    text: "Absolutely! I have done similar setups before. My quote for this would be GHS 1,800.",
    time: "10:05 AM",
  },
  {
    id: "4",
    sender: "client",
    text: "That works for me. Can we confirm the booking?",
    time: "10:07 AM",
  },
  {
    id: "5",
    sender: "decorator",
    text: "Perfect! I will send you a confirmation shortly. Looking forward to making your day beautiful! 🌸",
    time: "10:09 AM",
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: String(messages.length + 1),
      sender: "client",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, newMsg]);
    setInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View>
          <Text style={styles.name}>Akosua Mensah</Text>
          <Text style={styles.status}>🟢 Online</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.bookingTag}>Confirmed ✓</Text>
        </View>
      </View>

      {/* Brief Card */}
      <View style={styles.briefCard}>
        <Text style={styles.briefTitle}>📋 Attached Brief</Text>
        <Text style={styles.briefText}>
          Wedding · 25 Dec 2026 · Accra International Conference Centre · GHS
          1,800
        </Text>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messages} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.msgRow,
              msg.sender === "client" && styles.msgRowRight,
            ]}
          >
            {msg.sender === "decorator" && (
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>A</Text>
              </View>
            )}
            <View
              style={[
                styles.bubble,
                msg.sender === "client"
                  ? styles.bubbleClient
                  : styles.bubbleDecorator,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  msg.sender === "client" && styles.bubbleTextClient,
                ]}
              >
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.time,
                  msg.sender === "client" && styles.timeClient,
                ]}
              >
                {msg.time}
              </Text>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B4332",
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2D6A4F",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  name: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  status: { color: "#B7E4C7", fontSize: 12 },
  headerRight: { marginLeft: "auto" },
  bookingTag: { color: "#B7E4C7", fontSize: 12, fontWeight: "600" },
  briefCard: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#1B4332",
  },
  briefTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 4,
  },
  briefText: { fontSize: 12, color: "#444" },
  messages: { flex: 1, padding: 16 },
  msgRow: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
  msgRowRight: { flexDirection: "row-reverse" },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1B4332",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  msgAvatarText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  bubble: { maxWidth: "75%", padding: 12, borderRadius: 16 },
  bubbleDecorator: { backgroundColor: "#fff", borderBottomLeftRadius: 4 },
  bubbleClient: { backgroundColor: "#1B4332", borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: "#333" },
  bubbleTextClient: { color: "#fff" },
  time: { fontSize: 10, color: "#999", marginTop: 4 },
  timeClient: { color: "#B7E4C7", textAlign: "right" },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1B4332",
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: { color: "#fff", fontSize: 18 },
});

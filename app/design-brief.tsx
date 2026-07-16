import { useRouter } from "expo-router";
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
import { Colors } from "../constants/colors";

export default function DesignBriefScreen() {
  const router = useRouter();
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      router.push("/bookings");
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Design Brief</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* Design Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR AI DESIGN</Text>
          <View style={styles.designCard}>
            <View style={styles.designThumb}>
              <Text style={styles.designEmoji}>🏠</Text>
            </View>
            <View style={styles.designInfo}>
              <Text style={styles.designName}>Ghanaian Heritage Fusion</Text>
              <Text style={styles.designType}>Modern Living Room</Text>
              <Text style={styles.designPrompt}>
                Red and gold theme with kente patterns
              </Text>
            </View>
          </View>
        </View>

        {/* Decorator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SENDING TO</Text>
          <View style={styles.decoratorCard}>
            <View style={styles.decoratorAvatar}>
              <Text style={styles.decoratorEmoji}>👨🏽‍🎨</Text>
            </View>
            <View>
              <Text style={styles.decoratorName}>Kofi Decor</Text>
              <Text style={styles.decoratorLocation}>📍 Kumasi, Ghana</Text>
              <Text style={styles.decoratorSpec}>
                Wedding & Events Specialist
              </Text>
            </View>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EVENT DETAILS</Text>
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Event Date</Text>
              <TextInput
                style={styles.input}
                value={eventDate}
                onChangeText={setEventDate}
                placeholder="e.g. December 25, 2026"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Venue</Text>
              <TextInput
                style={styles.input}
                value={venue}
                onChangeText={setVenue}
                placeholder="e.g. Kumasi City Hotel"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Budget (GHS)</Text>
              <TextInput
                style={styles.input}
                value={budget}
                onChangeText={setBudget}
                placeholder="e.g. 2000"
                keyboardType="numeric"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special requests or requirements..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Send Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.sendBtn, sent && styles.sentBtn]}
          onPress={handleSend}
        >
          <Text style={styles.sendBtnText}>
            {sent ? "✓ Brief Sent!" : "📤 Send Brief to Decorator"}
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
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  designCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  designThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  designEmoji: { fontSize: 30 },
  designInfo: { flex: 1 },
  designName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  designType: { fontSize: 13, color: Colors.textMuted, marginBottom: 4 },
  designPrompt: { fontSize: 12, color: Colors.primary, fontWeight: "500" },
  decoratorCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  decoratorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  decoratorEmoji: { fontSize: 24 },
  decoratorName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  decoratorLocation: { fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
  decoratorSpec: { fontSize: 12, color: Colors.primary, fontWeight: "600" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldGroup: { padding: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
    paddingVertical: 4,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  bottomBar: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  sentBtn: { backgroundColor: Colors.accent },
  sendBtnText: { fontSize: 16, fontWeight: "700", color: Colors.white },
});

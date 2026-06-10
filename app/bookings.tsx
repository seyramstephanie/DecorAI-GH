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

const steps = ["Details", "Design", "Confirm"];

export default function BookingScreen() {
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  const eventTypes = [
    "Wedding",
    "Funeral",
    "Birthday",
    "Church",
    "Corporate",
    "Home",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Book a Decorator</Text>

      {/* Progress Steps */}
      <View style={styles.stepsRow}>
        {steps.map((s, i) => (
          <View key={i} style={styles.stepWrapper}>
            <View style={[styles.stepCircle, i <= step && styles.stepActive]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>
                {i + 1}
              </Text>
            </View>
            <Text
              style={[styles.stepLabel, i <= step && styles.stepLabelActive]}
            >
              {s}
            </Text>
            {i < steps.length - 1 && (
              <View
                style={[styles.stepLine, i < step && styles.stepLineActive]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Details</Text>

            <Text style={styles.label}>Event Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipRow}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {eventTypes.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.chip, eventType === e && styles.chipActive]}
                  onPress={() => setEventType(e)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      eventType === e && styles.chipTextActive,
                    ]}
                  >
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Event Date</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25 December 2026"
              placeholderTextColor="#999"
              value={eventDate}
              onChangeText={setEventDate}
            />

            <Text style={styles.label}>Venue</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Accra International Conference Centre"
              placeholderTextColor="#999"
              value={venue}
              onChangeText={setVenue}
            />

            <Text style={styles.label}>Budget (GHS)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2000"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />

            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe any special requirements..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attach AI Design</Text>
            <View style={styles.designBox}>
              <Text style={styles.designEmoji}>🪄</Text>
              <Text style={styles.designText}>
                Attach a saved AI decoration design to send to the decorator
              </Text>
              <TouchableOpacity style={styles.attachBtn}>
                <Text style={styles.attachBtnText}>Select Design</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.orText}>— or skip this step —</Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confirm Booking</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Event Type</Text>
                <Text style={styles.summaryValue}>
                  {eventType || "Not set"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>
                  {eventDate || "Not set"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Venue</Text>
                <Text style={styles.summaryValue}>{venue || "Not set"}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Budget</Text>
                <Text style={styles.summaryValue}>
                  {budget ? `GHS ${budget}` : "Not set"}
                </Text>
              </View>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Booking Status</Text>
              <Text style={styles.statusValue}>⏳ Enquiry</Text>
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.btnRow}>
          {step > 0 && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, step === 0 && { flex: 1 }]}
            onPress={() =>
              step < 2 ? setStep(step + 1) : alert("Booking sent to decorator!")
            }
          >
            <Text style={styles.nextBtnText}>
              {step === 2 ? "Send Booking Request" : "Next →"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    marginBottom: 20,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  stepWrapper: { alignItems: "center", flexDirection: "row" },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: { backgroundColor: "#1B4332" },
  stepNum: { color: "#999", fontWeight: "bold" },
  stepNumActive: { color: "#fff" },
  stepLabel: { fontSize: 11, color: "#999", marginLeft: 4, marginRight: 4 },
  stepLabelActive: { color: "#1B4332", fontWeight: "600" },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  stepLineActive: { backgroundColor: "#1B4332" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textarea: { height: 100, textAlignVertical: "top" },
  chipRow: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignSelf: "flex-start",
  },
  chipActive: { backgroundColor: "#1B4332", borderColor: "#1B4332" },
  chipText: { color: "#666", fontSize: 13 },
  chipTextActive: { color: "#fff" },
  designBox: {
    alignItems: "center",
    padding: 30,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    borderStyle: "dashed",
  },
  designEmoji: { fontSize: 40, marginBottom: 12 },
  designText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  attachBtn: {
    backgroundColor: "#1B4332",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  attachBtnText: { color: "#fff", fontWeight: "600" },
  orText: { textAlign: "center", color: "#999", marginTop: 16, fontSize: 13 },
  summaryCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { color: "#666", fontSize: 13 },
  summaryValue: { color: "#333", fontSize: 13, fontWeight: "600" },
  statusCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  statusLabel: { fontSize: 13, color: "#666", marginBottom: 4 },
  statusValue: { fontSize: 18, fontWeight: "bold", color: "#1B4332" },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  backBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  backBtnText: { color: "#1B4332", fontWeight: "600" },
  nextBtn: {
    flex: 2,
    backgroundColor: "#1B4332",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  nextBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

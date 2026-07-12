import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API } from "../constants/api";
import { Colors } from "../constants/colors";

export default function ResultScreen() {
  const router = useRouter();
  const { predictionId, eventType, decorStyle } = useLocalSearchParams<{
    predictionId: string;
    eventType: string;
    decorStyle: string;
  }>();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState("processing");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!predictionId) return;
    pollResult();
  }, [predictionId]);

  const pollResult = async () => {
    try {
      const response = await fetch(API.getAiResult(predictionId as string));
      const data = await response.json();

      if (data.message === "succeeded" && data.decorationPreview) {
        setPreviewUrl(data.decorationPreview);
        setItems(data.identifiedItems || []);
        setStatus("succeeded");
        setLoading(false);
      } else if (
        data.message === "failed" ||
        (data.message && data.message.startsWith("Error"))
      ) {
        setStatus("failed");
        setLoading(false);
      } else {
        setTimeout(pollResult, 3000);
      }
    } catch (e) {
      setStatus("failed");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating your design…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === "failed" || !previewUrl) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Something went wrong generating your design.
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.heroBtnText}>←</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: previewUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.body}>
          <Text style={styles.designTitle}>
            {eventType} · {decorStyle}
          </Text>

          <Text style={styles.itemsTitle}>ITEMS IN THIS DESIGN</Text>
          <View style={styles.itemsList}>
            {items.length === 0 ? (
              <Text style={styles.noItems}>No items identified yet</Text>
            ) : (
              items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemIcon}>
                    <Text style={styles.itemEmoji}>✨</Text>
                  </View>
                  <Text style={styles.itemLabel}>{item}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.bottomBtns}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => router.push("/shops")}
            >
              <Text style={styles.outlineBtnText}>🏪 Find Shops</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.solidBtn}
              onPress={() => router.push("/decorators")}
            >
              <Text style={styles.solidBtnText}>📋 Book Decorator</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  loadingText: { fontSize: 15, color: Colors.textMuted, textAlign: "center" },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  retryBtnText: { color: Colors.white, fontWeight: "700" },
  hero: { height: 320 },
  heroTop: { position: "absolute", top: 16, left: 20, zIndex: 10 },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white + "CC",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBtnText: { fontSize: 18, fontWeight: "600" },
  heroImage: { width: "100%", height: "100%" },
  body: { padding: 20 },
  designTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  itemsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  noItems: { padding: 16, color: Colors.textMuted, fontSize: 13 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 14,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.green100,
    alignItems: "center",
    justifyContent: "center",
  },
  itemEmoji: { fontSize: 18 },
  itemLabel: { fontSize: 14, fontWeight: "600", color: Colors.text, flex: 1 },
  bottomBtns: { flexDirection: "row", gap: 12 },
  outlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineBtnText: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  solidBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  solidBtnText: { fontSize: 14, fontWeight: "700", color: Colors.white },
});

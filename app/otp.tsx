import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API } from "../constants/api";
import { Colors } from "../constants/colors";

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<any[]>([]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setTimer(59);
    setCanResend(false);
    setOtp(["", "", "", ""]);
    inputs.current[0]?.focus();
    try {
      await fetch(API.resendOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: Array.isArray(email) ? email[0] : email,
        }),
      });
    } catch (e) {
      Alert.alert("Error", "Could not resend OTP");
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    setLoading(true);
    try {
      const response = await fetch(API.verifyOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: Array.isArray(email) ? email[0] : email,
          otp: otpCode,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        router.replace("/login");
      } else {
        Alert.alert("Verification Failed", data.message || "Invalid OTP");
      }
    } catch (e) {
      Alert.alert("Error", "Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.iconArea}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Text style={styles.iconEmoji}>🛡️</Text>
            </View>
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeEmoji}>✉️</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>We have sent a 4-digit code to</Text>
        <Text style={styles.phone}>
          {Array.isArray(email) ? email[0] : email}
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.primary}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend Code{" "}
              <Text style={styles.timerCount}>
                in 00:{timer < 10 ? `0${timer}` : timer}
              </Text>
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, !isComplete && styles.verifyBtnDisabled]}
          onPress={handleVerify}
          disabled={!isComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.verifyBtnText}>Verify ✓</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backArrow: { fontSize: 18, color: Colors.text },
  iconArea: { marginBottom: 32 },
  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.green100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: { fontSize: 32 },
  iconBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  iconBadgeEmoji: { fontSize: 13 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: "center" },
  phone: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 4,
    marginBottom: 36,
  },
  otpRow: { flexDirection: "row", gap: 14, marginBottom: 28 },
  otpBox: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.green100,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  resendText: { fontSize: 14, color: Colors.textMuted },
  resendLink: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  resendTimer: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  timerCount: { color: Colors.textMuted, fontWeight: "400" },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyBtnDisabled: { opacity: 0.4 },
  verifyBtnText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
});

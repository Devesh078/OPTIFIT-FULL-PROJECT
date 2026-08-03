import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";

export default function OTPVerificationScreen({ navigation, route }) {
  const { email } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleOTPChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", {
        email,
        otp: otpString,
      });

      Alert.alert("Success", "Email verified! You are now logged in.", [
        { text: "OK", onPress: () => navigation.replace("Main") },
      ]);

    } catch (error) {
      const msg = error.response?.data?.message || "Verification failed.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-otp", { email });
      Alert.alert("OTP Sent", "A new OTP has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error) {
      Alert.alert("Error", "Failed to resend OTP. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <LinearGradient
      colors={["#020617", "#0f172a", "#1e3a8a"]}
      style={styles.container}
    >
      <View style={styles.glassCard}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit OTP to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOTPChange(value.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              placeholderTextColor="#94a3b8"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#020617" />
            : <Text style={styles.buttonText}>Verify OTP</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resending}
          style={{ marginTop: 16 }}
        >
          <Text style={styles.link}>
            {resending ? "Sending..." : "Didn't receive OTP? Resend"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glassCard: {
    width: "90%",
    padding: 30,
    borderRadius: 30,
    backgroundColor: "rgba(147,197,253,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: "hidden",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#93c5fd",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#cbd5f5",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  email: {
    color: "#38bdf8",
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpInput: {
    width: 44,
    height: 54,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  button: {
    backgroundColor: "#38bdf8",
    padding: 15,
    borderRadius: 14,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#020617",
  },
  link: {
    textAlign: "center",
    color: "#cbd5f5",
  },
});
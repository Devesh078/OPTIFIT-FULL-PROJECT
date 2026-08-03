import React, { useState, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { LinearGradient } from "expo-linear-gradient";

WebBrowser.maybeCompleteAuthSession();

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: "1011318860548-rlbdvlknj6jn7h34i0b3i3gdjvcv0a2.apps.googleusercontent.com",
  androidClientId: "1011318860548-2pg7p76ohchel5qk59drpvujs5l126ao.apps.googleusercontent.com",
  redirectUri: makeRedirectUri({
    scheme: "optifitapp",
    native: "optifitapp://redirect",
  }),
  scopes: ["openid", "profile", "email"],
});

  // ── Handle Google Response ──
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSuccess(response.authentication.accessToken);
    } else if (response?.type === "error") {
      Alert.alert("Google Sign-In Failed", "Please try again.");
    }
  }, [response]);

  const handleGoogleSuccess = async (accessToken) => {
    setGoogleLoading(true);
    try {
      // Get user info from Google
      const userInfoRes = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoRes.json();

      // Send to backend
      const res = await api.post("/auth/google-login", {
        email: userInfo.email,
        name: userInfo.name,
        googleId: userInfo.id,
      });

      if (res.status === 206 && res.data.needsProfileSetup) {
        // New Google user — needs profile setup
        navigation.navigate("ProfileSetup", {
          email: res.data.email,
          name: res.data.name,
          googleId: res.data.googleId,
          isGoogleUser: true,
        });
      } else {
        // Existing user — log in directly
        await AsyncStorage.setItem("token", res.data.token);
        setIsLoggedIn(true);
      }
    } catch (error) {
      Alert.alert("Google Sign-In Error", error.response?.data?.message || "Something went wrong.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Handle Email/Password Login ──
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      await AsyncStorage.setItem("token", res.data.token);
      setIsLoggedIn(true);
    } catch (error) {
      const data = error.response?.data;

      if (data?.needsVerification) {
        // Email not verified — redirect to OTP screen
        Alert.alert(
          "Email Not Verified",
          "Please verify your email first.",
          [
            {
              text: "Verify Now",
              onPress: () => navigation.navigate("OTPVerification", { email: data.email }),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      } else {
        Alert.alert("Login Failed", data?.message || "Invalid credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#020617", "#0f172a", "#1e3a8a"]}
      style={styles.container}
    >
      <View style={styles.glassCard}>
        <Text style={styles.title}>OPTIFIT</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#cbd5f5"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#cbd5f5"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          style={{ alignSelf: "flex-end", marginBottom: 14 }}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#020617" />
            : <Text style={styles.buttonText}>Login</Text>
          }
        </TouchableOpacity>

        {/* Google Login Button */}
        <TouchableOpacity
          style={[styles.googleButton, (googleLoading || !request) && { opacity: 0.6 }]}
          onPress={() => promptAsync()}
          disabled={googleLoading || !request}
        >
          {googleLoading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.googleButtonText}>🔵 Continue with Google</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
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
    fontSize: 28,
    fontWeight: "700",
    color: "#93c5fd",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    color: "white",
  },
  forgotText: {
    color: "#38bdf8",
    fontSize: 13,
    marginTop: -8,
  },
  button: {
    backgroundColor: "#38bdf8",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#020617",
  },
  googleButton: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },
  googleButtonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#000000",
  },
  link: {
    textAlign: "center",
    marginTop: 8,
    color: "#cbd5f5",
  },
});
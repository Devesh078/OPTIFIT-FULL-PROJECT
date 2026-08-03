import api from "../services/api";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileSetupScreen({ navigation, route }) {
  const { email, password, name: googleName, googleId, isGoogleUser } = route.params;

  const [name, setName] = useState(googleName || "");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name || !age || !height || !weight || !goal || !gender) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      if (isGoogleUser) {
        // ── Google User Registration ──
        const res = await api.post("/auth/google-register", {
          name: name.trim(),
          email,
          googleId,
          age: parseInt(age),
          height: parseInt(height),
          weight: parseInt(weight),
          gender,
          goal,
          activityLevel: "moderate",
        });

        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem(
          "userProfile",
          JSON.stringify({ name: name.trim(), age, height, weight, gender, goal })
        );

        // Google users are pre-verified — go straight to app
        navigation.replace("Main");

      } else {
        // ── Email/Password Registration ──
        await api.post("/auth/register", {
          name: name.trim(),
          email,
          password,
          age: parseInt(age),
          height: parseInt(height),
          weight: parseInt(weight),
          gender,
          goal,
          activityLevel: "moderate",
        });

        await AsyncStorage.setItem(
          "userProfile",
          JSON.stringify({ name: name.trim(), age, height, weight, gender, goal })
        );

        // Navigate to OTP verification
        Alert.alert(
          "Verify Your Email",
          `A 6-digit OTP has been sent to ${email}. Please verify to complete registration.`,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("OTPVerification", { email }),
            },
          ]
        );
      }

    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      console.log("Signup error:", errMsg);
      Alert.alert("Signup Failed", errMsg);
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
        <Text style={styles.title}>Tell us about yourself</Text>

        {isGoogleUser && (
          <View style={styles.googleBadge}>
            <Text style={styles.googleBadgeText}>🔵 Signing up with Google</Text>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>

          <TextInput
            placeholder="Name"
            placeholderTextColor="#cbd5f5"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Age"
            placeholderTextColor="#cbd5f5"
            keyboardType="numeric"
            style={styles.input}
            value={age}
            onChangeText={setAge}
          />

          <TextInput
            placeholder="Height (cm)"
            placeholderTextColor="#cbd5f5"
            keyboardType="numeric"
            style={styles.input}
            value={height}
            onChangeText={setHeight}
          />

          <TextInput
            placeholder="Weight (kg)"
            placeholderTextColor="#cbd5f5"
            keyboardType="numeric"
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
          />

          {/* Gender Selection */}
          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionButton, gender === "male" && styles.selectedOption]}
              onPress={() => setGender("male")}
            >
              <Text style={styles.optionText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, gender === "female" && styles.selectedOption]}
              onPress={() => setGender("female")}
            >
              <Text style={styles.optionText}>Female</Text>
            </TouchableOpacity>
          </View>

          {/* Goal Selection */}
          <Text style={styles.sectionLabel}>Goal</Text>
          <View style={styles.goalContainer}>

            <TouchableOpacity
              style={[styles.goalButton, goal === "muscle_build" && styles.selectedOption]}
              onPress={() => setGoal("muscle_build")}
            >
              <Text style={styles.optionText}>Muscle Build</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.goalButton, goal === "weight_loss" && styles.selectedOption]}
              onPress={() => setGoal("weight_loss")}
            >
              <Text style={styles.optionText}>Weight Loss</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.goalButton, goal === "maintenance" && styles.selectedOption]}
              onPress={() => setGoal("maintenance")}
            >
              <Text style={styles.optionText}>Maintain Weight</Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#020617" />
              : <Text style={styles.buttonText}>Continue</Text>
            }
          </TouchableOpacity>

        </ScrollView>
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
    elevation: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#93c5fd",
    textAlign: "center",
    marginBottom: 20,
  },
  googleBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  googleBadgeText: {
    color: "#93c5fd",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    color: "white",
  },
  sectionLabel: {
    color: "#cbd5f5",
    marginTop: 10,
    marginBottom: 8,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#38bdf8",
  },
  optionText: {
    color: "white",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#38bdf8",
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#020617",
  },
  goalContainer: {
    marginBottom: 15,
  },
  goalButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 10,
    alignItems: "center",
  },
});
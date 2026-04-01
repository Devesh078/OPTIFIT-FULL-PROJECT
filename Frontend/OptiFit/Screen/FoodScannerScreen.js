import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import api from "../services/api";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FoodScannerScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [adding, setAdding] = useState(false);

  // =========================
  // PICK IMAGE
  // =========================
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow gallery access");
      return;
    }

    let res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  // =========================
  // OPEN CAMERA
  // =========================
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow camera access");
      return;
    }

    let res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  // =========================
  // ANALYZE FOOD (FIXED)
  // =========================
  const analyzeFood = async () => {
    if (!image) {
      Alert.alert("Error", "Select image first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("image", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      const response = await api.post("/food/analyze-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
    } catch (error) {
      console.log("Analyze error:", error.message);

      // fallback (for testing if backend not ready)
      setResult({
        calories: 450,
        protein: 20,
        carbs: 50,
        fats: 15,
      });

      Alert.alert("Using demo data (backend not ready)");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD TO INTAKE
  // =========================
  const addToDailyIntake = async () => {
    if (!result) return;

    setAdding(true);

    setTimeout(() => {
      setAdding(false);
      setImage(null);
      setResult(null);

      Alert.alert("Added", "Meal added to daily intake");
    }, 800);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Food Scanner</Text>
        <Text style={styles.subtitle}>
          Capture or upload your meal and get nutrition instantly
        </Text>

        <View style={styles.uploadCard}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderBox}>
              <Ionicons name="image-outline" size={48} color="#64748B" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={openCamera}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.secondaryButtonText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
            <Ionicons name="images-outline" size={20} color="#0B1220" />
            <Text style={styles.primaryButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={analyzeFood}
            disabled={loading}
          >
            <Ionicons name="scan-outline" size={20} color="#fff" />
            <Text style={styles.analyzeButtonText}>Analyze Food</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#00E676" />
            <Text style={styles.loaderText}>Analyzing...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Nutrition Result</Text>

            <View style={styles.macroGrid}>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>{result.calories}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>

              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>{result.protein} g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>

              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>{result.carbs} g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>

              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>{result.fats} g</Text>
                <Text style={styles.macroLabel}>Fats</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={addToDailyIntake}
            >
              <Text style={styles.addButtonText}>
                {adding ? "Adding..." : "Add to Daily Intake"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#0B1220",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    color: "#00E676",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20,
  },
  uploadCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  placeholderBox: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#CBD5E1",
    marginTop: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  secondaryButton: {
    width: "48%",
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    marginLeft: 6,
  },
  primaryButton: {
    width: "48%",
    backgroundColor: "#00E676",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#0B1220",
    marginLeft: 6,
    fontWeight: "bold",
  },
  analyzeButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  analyzeButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "bold",
  },
  loaderBox: {
    alignItems: "center",
    marginVertical: 10,
  },
  loaderText: {
    color: "#94A3B8",
    marginTop: 6,
  },
  resultCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  macroCard: {
    width: "48%",
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  macroValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  macroLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  addButton: {
    backgroundColor: "#00E676",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#0B1220",
    fontWeight: "bold",
  },
});
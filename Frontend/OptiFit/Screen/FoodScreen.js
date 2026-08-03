import React, { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import api from "../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

// ─────────────────────────────────────────────
// Food type detection
// ─────────────────────────────────────────────

const LIQUID_KEYWORDS = [
  "milk", "juice", "water", "tea", "coffee", "lassi", "buttermilk",
  "shake", "smoothie", "oil", "ghee", "coconut water", "soup",
  "broth", "stock", "drink", "beverage", "alcohol", "beer", "wine",
  "chaas", "nimbu pani", "soda", "cold drink", "lemonade", "dahi",
  "yogurt drink", "protein shake", "whey", "almond milk", "soy milk",
];

const PIECE_KEYWORDS = [
  "egg", "banana", "apple", "orange", "mango", "chapati", "roti",
  "paratha", "bread", "biscuit", "cookie", "ladoo", "modak",
  "idli", "vada", "samosa", "kachori", "puri", "bhature",
  "date", "fig", "walnut", "almond", "cashew",
];

const detectFoodType = (name) => {
  const lower = name.toLowerCase();
  if (LIQUID_KEYWORDS.some((k) => lower.includes(k))) return "liquid";
  if (PIECE_KEYWORDS.some((k) => lower.includes(k))) return "piece";
  return "solid";
};

// Units per food type
const UNIT_OPTIONS = {
  solid: [
    { label: "g", value: "g" },
    { label: "kg", value: "kg" },
    { label: "cup", value: "cup" },
    { label: "tbsp", value: "tbsp" },
    { label: "tsp", value: "tsp" },
  ],
  liquid: [
    { label: "ml", value: "ml" },
    { label: "L", value: "l" },
    { label: "cup", value: "cup" },
    { label: "tbsp", value: "tbsp" },
    { label: "tsp", value: "tsp" },
  ],
  piece: [
    { label: "piece", value: "piece" },
    { label: "g", value: "g" },
    { label: "cup", value: "cup" },
  ],
};

const DEFAULT_UNIT = {
  solid: "g",
  liquid: "ml",
  piece: "piece",
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const FoodScreen = () => {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [foodType, setFoodType] = useState("solid");

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [foods, setFoods] = useState([]);

  // ── Detect food type when name changes ──
  useEffect(() => {
    if (foodName.trim().length > 0) {
      const type = detectFoodType(foodName);
      setFoodType(type);
      setUnit(DEFAULT_UNIT[type]);
    }
  }, [foodName]);

  // ── Fetch nutrition on food/quantity/unit change ──
  useEffect(() => {
    const timeout = setTimeout(() => {
      const qty = Number(quantity);
      if (foodName.trim().length > 0 && !isNaN(qty) && qty > 0 && unit.trim().length > 0) {
        fetchNutrition(foodName);
      } else {
        setCalories("");
        setProtein("");
        setCarbs("");
        setFats("");
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [foodName, quantity, unit]);

  // ── Autocomplete ──
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (foodName.length > 1) {
        try {
          const res = await api.get(`/food/search?q=${foodName}`);
          setSuggestions(res.data.foods || []);
          setShowDropdown(true);
        } catch (err) {
          console.log("Search error:", err.message);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [foodName]);

  // ── Fetch today's food list ──
  const fetchFoods = async () => {
    try {
      const res = await api.get("/food/list");
      setFoods(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Fetch foods error:", error.message);
      setFoods([]);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchNutrition = async (name) => {
    try {
      const normalizedUnit = unit.toLowerCase(); // ← add this
      const res = await api.get(
        `/food/nutrition?name=${name}&quantity=${Number(quantity)}&unit=${unit}`
      );
      const data = res.data.nutrition;
      setCalories(data.calories ?? "");
      setProtein(data.protein ?? "");
      setCarbs(data.carbs ?? "");
      setFats(data.fats ?? "");
    } catch (error) {
      console.log("Nutrition error:", error.message);
    }
  };

  const handleAddFood = async () => {
    try {
      if (!foodName || !quantity || !unit) {
        alert("Enter food, quantity and unit");
        return;
      }
      await api.post("/food/log", {
        foodName,
        quantity: Number(quantity),
        unit: unit.toLowerCase(), // ← normalize here too
        calories,
        protein,
        carbs,
        fats,
      });
      setFoodName("");
      setQuantity("");
      setUnit("g");
      setFoodType("solid");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
      fetchFoods();
    } catch (error) {
      console.log("Add food error:", error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/food/delete/${id}`);
      fetchFoods();
    } catch (error) {
      console.log("Delete error:", error.message);
    }
  };

  const unitOptions = UNIT_OPTIONS[foodType] || UNIT_OPTIONS.solid;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <View style={styles.container}>
        <Text style={styles.title}>Food Log</Text>

        {/* Food Name Input */}
        <TextInput
          placeholder="Enter food (e.g. paneer, milk, egg)"
          placeholderTextColor="#94A3B8"
          value={foodName}
          onChangeText={(text) => {
            setFoodName(text);
            setShowDropdown(true);
          }}
          style={styles.input}
        />

        {/* Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.name}
                onPress={() => {
                  setFoodName(item.name);
                  const type = detectFoodType(item.name);
                  setFoodType(type);
                  setUnit(DEFAULT_UNIT[type]);
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Nutrition Preview Card */}
        <View style={styles.nutritionCard}>
          {calories ? (
            <>
              <View style={styles.row}>
                <View style={styles.metric}>
                  <MaterialCommunityIcons name="fire" size={20} color="#22C55E" />
                  <Text style={styles.metricText}>{calories} kcal</Text>
                </View>
                <View style={styles.metric}>
                  <MaterialCommunityIcons name="food-steak" size={20} color="#3B82F6" />
                  <Text style={styles.metricText}>{protein}g protein</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.metric}>
                  <MaterialCommunityIcons name="grain" size={20} color="#F59E0B" />
                  <Text style={styles.metricText}>{carbs}g carbs</Text>
                </View>
                <View style={styles.metric}>
                  <MaterialCommunityIcons name="oil" size={20} color="#EF4444" />
                  <Text style={styles.metricText}>{fats}g fats</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.placeholderText}>
              Enter food name and quantity to see nutrition
            </Text>
          )}
        </View>

        {/* Quantity Input */}
        <TextInput
          placeholder={
            foodType === "liquid"
              ? "Quantity (e.g. 250)"
              : foodType === "piece"
              ? "Quantity (e.g. 2)"
              : "Quantity (e.g. 100)"
          }
          placeholderTextColor="#94A3B8"
          value={quantity}
          keyboardType="numeric"
          onChangeText={(text) => setQuantity(text.replace(/[^0-9.]/g, ""))}
          style={styles.input}
        />

        {/* Smart Unit Selector */}
        <View style={styles.unitSection}>
          <Text style={styles.unitLabel}>
            Unit
            <Text style={styles.unitHint}>
              {" "}
              ({foodType === "liquid" ? "liquid" : foodType === "piece" ? "countable" : "solid"})
            </Text>
          </Text>
          <View style={styles.unitRow}>
            {unitOptions.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[styles.unitChip, unit === u.value && styles.unitChipSelected]}
                onPress={() => setUnit(u.value)}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    unit === u.value && styles.unitChipTextSelected,
                  ]}
                >
                  {u.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Food Button */}
        <TouchableOpacity onPress={handleAddFood} style={styles.button}>
          <Text style={styles.buttonText}>Add Food</Text>
        </TouchableOpacity>

        {/* Food List */}
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {foods.length === 0 && (
              <Text style={styles.emptyText}>No food logged today yet.</Text>
            )}
            {foods.map((item) => (
              <Swipeable
                key={item._id}
                renderRightActions={() => (
                  <TouchableOpacity
                    onPress={() => handleDelete(item._id)}
                    style={styles.deleteButton}
                  >
                    <MaterialCommunityIcons name="trash-can" size={22} color="#fff" />
                  </TouchableOpacity>
                )}
              >
                <View style={styles.foodItem}>
                  <Text style={styles.foodName}>
                    {item.foodName}{" "}
                    <Text style={styles.foodQty}>
                      ({item.quantity} {item.unit})
                    </Text>
                  </Text>
                  <View style={styles.row}>
                    <View style={styles.metric}>
                      <MaterialCommunityIcons name="fire" size={16} color="#22C55E" />
                      <Text style={styles.metricSmall}>{item.calories} kcal</Text>
                    </View>
                    <View style={styles.metric}>
                      <MaterialCommunityIcons name="food-steak" size={16} color="#3B82F6" />
                      <Text style={styles.metricSmall}>{item.protein}g</Text>
                    </View>
                    <View style={styles.metric}>
                      <MaterialCommunityIcons name="grain" size={16} color="#F59E0B" />
                      <Text style={styles.metricSmall}>{item.carbs}g</Text>
                    </View>
                    <View style={styles.metric}>
                      <MaterialCommunityIcons name="oil" size={16} color="#EF4444" />
                      <Text style={styles.metricSmall}>{item.fats}g</Text>
                    </View>
                  </View>
                </View>
              </Swipeable>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FoodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    color: "#fff",
  },
  dropdown: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#334155",
  },
  dropdownText: {
    color: "#fff",
  },
  nutritionCard: {
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    minHeight: 60,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    color: "#fff",
    fontWeight: "600",
  },
  metricSmall: {
    color: "#94A3B8",
    fontSize: 12,
  },
  placeholderText: {
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 13,
  },
  unitSection: {
    marginBottom: 14,
  },
  unitLabel: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "600",
  },
  unitHint: {
    color: "#475569",
    fontStyle: "italic",
  },
  unitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },
  unitChipSelected: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  unitChipText: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 13,
  },
  unitChipTextSelected: {
    color: "#0F172A",
  },
  button: {
    backgroundColor: "#22C55E",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#0F172A",
    fontSize: 16,
  },
  foodItem: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  foodName: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 15,
  },
  foodQty: {
    color: "#94A3B8",
    fontWeight: "400",
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 12,
    marginTop: 10,
  },
  emptyText: {
    color: "#475569",
    textAlign: "center",
    marginTop: 30,
    fontSize: 14,
  },
});
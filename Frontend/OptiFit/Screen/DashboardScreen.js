import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

export default function DashboardScreen({ navigation, setIsLoggedIn }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [sleepHours, setSleepHours] = useState("");
  const [sleepLogged, setSleepLogged] = useState(false);

  // Check today's sleep status from API (File 1), fallback to AsyncStorage (File 2)
  const checkSleepStatus = async () => {
  try {
    const res = await api.get("/sleep/today");
    if (!res.data) {
      setSleepLogged(false);

      // Prompt from 5am to 2pm (covers early risers and late sleepers)
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 14) {
        setSleepModalVisible(true);
      }
    } else {
      setSleepLogged(true);
    }
  } catch (error) {
    console.log("Sleep status check:", error.response?.data || error.message);
  }
};

  const loadDashboard = async () => {
    try {
      // Try to load from API first (File 1)
      let apiData = null;
      try {
        const res = await api.get("/dashboard");
        apiData = res.data;
      } catch (apiError) {
        console.log("API unavailable, using local storage:", apiError.message);
      }

      // Load local AsyncStorage data (File 2)
      const storedWater = await AsyncStorage.getItem("water");
      const waterConsumed = storedWater ? parseInt(storedWater, 10) : 0;

      const storedSleep = await AsyncStorage.getItem("sleepHours");
      const storedSleepDate = await AsyncStorage.getItem("sleepDate");
      const today = new Date().toDateString();

      let sleepValue = 0;
      let isSleepLoggedToday = false;

      if (storedSleep && storedSleepDate === today) {
        sleepValue = parseFloat(storedSleep);
        isSleepLoggedToday = true;
      }

      // Merge API data with local storage data
      setData({
        calories: apiData?.calories || {
          target: 2000,
          consumed: 1200,
          remaining: 800,
        },
        protein: apiData?.protein || {
          target: 120,
          consumed: 60,
        },
        water: { consumed: apiData?.water?.consumed ?? waterConsumed },
        steps: apiData?.steps || { steps: 0 },
        sleep: {
          sleepHours:
            apiData?.sleep?.sleepHours != null
              ? apiData.sleep.sleepHours
              : sleepValue,
        },
        recovery: apiData?.recovery || { score: 75 },
        workout: apiData?.workout || { caloriesBurned: 0 },
      });

      setSleepLogged(isSleepLoggedToday);
    } catch (error) {
      console.log(error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    checkSleepStatus();
  }, []);

  // Reload dashboard every time screen is focused (File 2)
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const submitSleep = async () => {
    if (!sleepHours) return;

    const enteredSleep = parseFloat(sleepHours);
    if (isNaN(enteredSleep)) return;

    const today = new Date().toDateString();
    const todayKey = new Date().toISOString().split("T")[0];

    try {
      // Save to API (File 1)
      try {
        await api.post("/sleep", { sleepHours: enteredSleep });
      } catch (apiError) {
        console.log("API sleep save failed, saving locally:", apiError.message);
      }

      // Save to AsyncStorage (File 2)
      await AsyncStorage.setItem("sleepHours", enteredSleep.toString());
      await AsyncStorage.setItem("sleepDate", today);

      const existingHistory = await AsyncStorage.getItem("sleepHistory");
      const parsedHistory = existingHistory ? JSON.parse(existingHistory) : {};
      parsedHistory[todayKey] = enteredSleep;
      await AsyncStorage.setItem("sleepHistory", JSON.stringify(parsedHistory));

      setData((prev) => ({
        ...prev,
        sleep: { sleepHours: enteredSleep },
      }));

      setSleepLogged(true);
      setSleepModalVisible(false);
      setSleepHours("");
      loadDashboard();
    } catch (error) {
      console.log("Error saving sleep:", error);
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00E676" />
      </View>
    );
  }

  const calorieTarget = data?.calories?.target || 0;
  const calorieConsumed = data?.calories?.consumed || 0;
  const calorieRemaining = data?.calories?.remaining || 0;

  const proteinTarget = data?.protein?.target || 0;
  const proteinConsumed = data?.protein?.consumed || 0;

  const sleepHoursValue = data?.sleep?.sleepHours || 0;
  const sleepDebt = Math.max(8 - sleepHoursValue, 0);

  const fillPercentage =
    calorieTarget > 0
      ? Math.min((calorieConsumed / calorieTarget) * 100, 100)
      : 0;

  const proteinFill =
    proteinTarget > 0
      ? Math.min((proteinConsumed / proteinTarget) * 100, 100)
      : 0;

  const calorieColor = calorieRemaining < 0 ? "#ef4444" : "#00E676";

  const sleepHoursColor =
    sleepHoursValue <= 3
      ? "#ef4444"
      : sleepHoursValue <= 6
      ? "#facc15"
      : "#00E676";

  const sleepDebtColor =
    sleepDebt === 0 ? "#00E676" : sleepDebt <= 2 ? "#facc15" : "#ef4444";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    else if (hour >= 12 && hour < 17) return "Good Afternoon";
    else if (hour >= 17 && hour < 20) return "Good Evening";
    else return "Good Night";
  };

  const greeting = getGreeting();

  return (
    <>
      {/* Sleep Modal */}
      <Modal visible={sleepModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              How many hours did you sleep today?
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter hours (e.g. 7.5)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={sleepHours}
              onChangeText={setSleepHours}
            />

            <TouchableOpacity style={styles.modalButton} onPress={submitSleep}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <SafeAreaView style={{ flex: 1, backgroundColor: "#0B1220" }}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={calorieColor}
            />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* HEADER */}
            <View style={styles.header}>
              <View>
                <Text style={styles.logo}>OPTIFIT</Text>
                <Text style={styles.greeting}>{greeting}</Text>
              </View>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </View>

            <Text style={styles.sectionTitle}>Today</Text>

            {/* CALORIE RING */}
            <View style={styles.hero}>
            <AnimatedCircularProgress
  size={220}
  width={12}
  fill={fillPercentage}
  tintColor={calorieColor}
  backgroundColor="#1E293B"
  lineCap="round"
>
  {() => {
    if (calorieRemaining < 0) {
      return (
        <>
          <Text style={[styles.remaining, { fontSize: 18 }]}>
            ⚠ Goal Reached
          </Text>
          <Text style={[styles.subText, { fontSize: 13 }]}>
            Limit exceeded
          </Text>
        </>
      );
    }

    if (calorieRemaining === 0) {
      return (
        <>
          <Text style={styles.remaining}>0</Text>
          <Text style={styles.subText}>Goal Completed</Text>
        </>
      );
    }

    return (
      <>
        <Text style={styles.remaining}>{calorieRemaining}</Text>
        <Text style={styles.subText}>Calories Remaining</Text>
      </>
    );
  }}
</AnimatedCircularProgress>

              
              <Text style={styles.meta}>
                {calorieConsumed} consumed • Goal {calorieTarget}
              </Text>
           {data?.workout?.caloriesBurned > 0 && (
  <View style={styles.workoutBox}>
    <Ionicons name="fitness-outline" size={16} color="#f97316" style={{ marginRight: 6 }} />
    <Text style={styles.workoutText}>
      Burned {data.workout.caloriesBurned} kcal from workout
    </Text>
  </View>
)}
</View>
{/* PROTEIN RING */}
<View style={styles.hero}>
  <AnimatedCircularProgress
    size={160}
    width={10}
    fill={proteinFill}
    tintColor={proteinConsumed > proteinTarget ? "#ef4444" : "#38bdf8"}
    backgroundColor="#1E293B"
    lineCap="round"
  >
    {() => (
      <>
        <Text style={[styles.remainingSmall, { color: proteinConsumed > proteinTarget ? "#ef4444" : "#fff" }]}>
          {proteinConsumed}/{proteinTarget}
        </Text>
        <Text style={styles.subText}>Protein (g)</Text>
      </>
    )}
  </AnimatedCircularProgress>

  {/* ✅ Protein status message */}
  {proteinConsumed >= proteinTarget && proteinTarget > 0 ? (
    <View style={{
      marginTop: 10,
      backgroundColor: proteinConsumed > proteinTarget ? "#450a0a" : "#052e16",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: proteinConsumed > proteinTarget ? "#ef4444" : "#00E676",
    }}>
      <Text style={{
        color: proteinConsumed > proteinTarget ? "#ef4444" : "#00E676",
        fontWeight: "700",
        fontSize: 13,
      }}>
        {proteinConsumed > proteinTarget
          ? `⚠ Protein exceeded by ${proteinConsumed - proteinTarget}g`
          : "✅ Protein goal achieved!"}
      </Text>
    </View>
  ) : null}
</View>

            {/* QUICK ACTIONS */}
            <Text style={styles.overviewTitle}>Quick Actions</Text>

            <View style={styles.quickActions}>
              <TouchableOpacity
  style={[
  styles.quickBtn,
  styles.coachBtn
]}
  onPress={() => navigation.navigate("Coach")}
>
  <Ionicons
  name="flash-outline"
  size={22}
  color="#38BDF8"
/>

  <Text
    style={[
      styles.quickText,
      { color: "#38BDF8" }
    ]}
  >
   Coach
  </Text>
</TouchableOpacity>

              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => navigation.navigate("Water")}
              >
                <Ionicons name="water" size={22} color="#fff" />
                <Text style={styles.quickText}>Water</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => navigation.navigate("Steps")}
              >
                <Ionicons name="walk" size={22} color="#fff" />
                <Text style={styles.quickText}>Steps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => {
                  if (!sleepLogged) {
                    setSleepModalVisible(true);
                  }
                }}
              >
                <Ionicons name="moon" size={22} color="#fff" />
                <Text style={styles.quickText}>
                  {sleepLogged ? "Logged" : "Sleep"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* HEALTH OVERVIEW */}
            <Text style={styles.overviewTitle}>Health Overview</Text>

            <View style={styles.overviewContainer}>
              <View style={styles.overviewCard}>
                <Ionicons name="moon" size={28} color={sleepHoursColor} />
                <Text style={[styles.overviewValue, { color: sleepHoursColor }]}>
                  {sleepHoursValue} hrs
                </Text>
                <Text style={styles.overviewLabel}>Sleep</Text>
              </View>

              <View style={styles.overviewCard}>
                <Ionicons name="water" size={28} color="#06b6d4" />
                <Text style={styles.overviewValue}>
                  {data?.water?.consumed || 0} ml
                </Text>
                <Text style={styles.overviewLabel}>Water</Text>
              </View>

              <View style={styles.overviewCard}>
                <Ionicons name="walk" size={28} color="#facc15" />
                <Text style={styles.overviewValue}>
                  {data?.steps?.steps || 0}
                </Text>
                <Text style={styles.overviewLabel}>Steps</Text>
              </View>

              {/* Sleep Debt — tappable, navigates to SleepDebt screen */}
              <TouchableOpacity
                style={styles.overviewCard}
                onPress={() => navigation.navigate("SleepDebt")}
              >
                <Ionicons
                  name="trending-down"
                  size={28}
                  color={sleepDebtColor}
                />
                <Text style={[styles.overviewValue, { color: sleepDebtColor }]}>
                  {sleepDebt.toFixed(1)} hrs
                </Text>
                <Text style={styles.overviewLabel}>Sleep Debt</Text>
                <Text style={styles.sleepDebtHint}>Tap to view history</Text>
              </TouchableOpacity>
            </View>

            {/* RECOVERY SCORE */}
            <View style={styles.recoveryCard}>
              <Text style={styles.recoveryTitle}>Recovery Score</Text>
              <Text style={styles.recoveryValue}>
                {data?.recovery?.score || 75}%
              </Text>
              <Text style={styles.recoverySub}>
                Based on sleep, protein & activity
              </Text>
            </View>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("FoodScanner")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    padding: 20,
  },

  loader: {
    flex: 1,
    backgroundColor: "#0B1220",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    color: "#00E676",
    fontSize: 22,
    fontWeight: "bold",
  },

  greeting: {
    color: "#94A3B8",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
  },

  hero: {
    alignItems: "center",
    marginBottom: 35,
  },

  remaining: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },

  remainingSmall: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  subText: {
    color: "#94A3B8",
    marginTop: 5,
  },

  meta: {
    color: "#64748B",
    marginTop: 8,
  },

  overviewTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  quickBtn: {
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "22%",
  },

  quickText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },

  overviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  overviewCard: {
    backgroundColor: "#1E293B",
    width: "48%",
    paddingVertical: 25,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },

  overviewValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  overviewLabel: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 13,
  },

  sleepDebtHint: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },

  recoveryCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: "center",
  },

  recoveryTitle: {
    color: "#94A3B8",
  },

  recoveryValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#00E676",
    marginVertical: 5,
  },

  recoverySub: {
    color: "#64748B",
    fontSize: 12,
  },

  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#00E676",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: "#1E293B",
    padding: 25,
    borderRadius: 20,
    width: "85%",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  modalInput: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    marginBottom: 15,
  },

  modalButton: {
    backgroundColor: "#00E676",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  modalButtonText: {
    fontWeight: "bold",
    color: "#0F172A",
  },
workoutBox: {
  marginTop: 10,
  backgroundColor: "#1E293B",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 14,
  alignSelf: "stretch",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginHorizontal: 10,
},
workoutText: {
  color: "#f97316",
  fontSize: 13,
  fontWeight: "500",
},

coachBtn: {
  backgroundColor: "#111827",
  borderWidth: 1,
  borderColor: "#1E293B",
},

});
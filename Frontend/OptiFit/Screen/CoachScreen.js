import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";
import api from "../services/api";

export default function CoachScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const historyRes = await api.get("/coach/history");
      const summaryRes = await api.get("/coach/summary");
      setHistory(historyRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>AI Coach</Text>
        <Text style={styles.sparkleIcon}>✦</Text>
      </View>
      <Text style={styles.subtitle}>
        Personalized fitness guidance based on your data
      </Text>

      {/* Recovery Score Card */}
      <View style={styles.recoveryCard}>
        <Text style={styles.recoveryTitle}>RECOVERY SCORE</Text>

        <View style={styles.scoreRow}>
          <Text style={styles.score}>{summary?.readinessScore || 70}</Text>

          <View style={styles.statusBlock}>
            <Text style={styles.statusLabel}>
              {summary?.readinessStatus || "Good"}
            </Text>
            <View style={styles.onTrackRow}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.onTrack}>On track</Text>
            </View>
          </View>

          <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
              <Text style={styles.heartIcon}>🤍</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricIcon}>🌙</Text>
            <Text style={styles.metricLabel}>SLEEP</Text>
            <Text style={styles.metricValue}>
              {summary?.averageSleep || 6.9}h
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBox}>
            <Text style={styles.metricIcon}>🥩</Text>
            <Text style={styles.metricLabel}>PROTEIN GOAL</Text>
            <Text style={styles.metricValue}>
  {summary?.proteinGoal
    ? `${summary.proteinGoal}g`
    : "--"}
</Text>
          </View>
        </View>
      </View>

      {/* Today's Focus Card */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitleIcon}>🎯</Text>
          <Text style={styles.cardTitle}>TODAY'S FOCUS</Text>
        </View>

        <View style={styles.focusGrid}>
          {[
            { icon: "🌙", label: "Sleep", value: "8 Hours"},
   
          {
  icon: "🥩",
  label: "Protein",
  value: summary?.proteinGoal
    ? `${summary.proteinGoal}g`
    : "--",
},
            { icon: "💧", label: "Water", value: summary?.waterGoal
    ? `${summary.waterGoal} ml`
    : "--",},
            { icon: "🏋️", label: "Workout", value: "Moderate" },
          ].map((item) => (
            <View key={item.label} style={styles.focusItemCard}>
              <Text style={styles.focusIconText}>{item.icon}</Text>
              <Text style={styles.focusLabel}>{item.label}</Text>
              <Text style={styles.focusValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Conversations */}
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionLeft}>
          <Text style={styles.sectionIcon}>💬</Text>
          <Text style={styles.sectionTitle}>RECENT CONVERSATIONS</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("CoachHistory")}>
          <Text style={styles.viewAll}>View all  ›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.historyScroll}
      >
        {(history.length > 0
          ? history
          : [
              { _id: "1", question: "How can I recover faster?", createdAt: new Date() },
              { _id: "2", question: "What should I focus on tomorrow?", createdAt: new Date() },
              { _id: "3", question: "Why am I so tired?", createdAt: new Date() },
            ]
        )
          .slice(0, 5)
          .map((chat) => (
            <TouchableOpacity
              key={chat._id}
              style={styles.historyCard}
              onPress={() =>
                navigation.navigate("CoachChat", { question: chat.question })
              }
            >
              <Text style={styles.historyCardIcon}>💬</Text>
              <Text style={styles.historyQuestion} numberOfLines={2}>
                {chat.question}
              </Text>
              <Text style={styles.historyDate}>
                {new Date(chat.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* Chat Bar */}
      <TouchableOpacity
        style={styles.chatBar}
        onPress={() => navigation.navigate("CoachChat")}
      >
        <Text style={styles.chatSparkle}>✦</Text>
        <Text style={styles.chatPlaceholder}>Ask your coach anything...</Text>
        <View style={styles.sendBubble}>
          <Text style={styles.sendIcon}>→</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 16,
    paddingTop: 50,        // push content away from status bar at top
    paddingBottom: 24,     // breathing room at bottom
    justifyContent: "space-between", // evenly distribute all sections
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },
  sparkleIcon: {
    color: "#00E676",
    fontSize: 20,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 12,
  },

  // Recovery Card
  recoveryCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  recoveryTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  score: {
    color: "#FFFFFF",
    fontSize: 56,
    fontWeight: "bold",
    lineHeight: 60,
    marginRight: 14,
  },
  statusBlock: {
    flex: 1,
    justifyContent: "center",
  },
  statusLabel: {
    color: "#00E676",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  onTrackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    color: "#00E676",
    fontSize: 8,
  },
  onTrack: {
    color: "#94A3B8",
    fontSize: 12,
  },
  circleOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 5,
    borderColor: "#00E676",
    borderTopColor: "#1F2937",
    borderRightColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "130deg" }],
  },
  circleInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1A2235",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "-130deg" }],
  },
  heartIcon: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#1F2937",
    marginVertical: 10,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricBox: {
    flex: 1,
    paddingHorizontal: 4,
  },
  metricDivider: {
    width: 1,
    height: 44,
    backgroundColor: "#1F2937",
  },
  metricIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  metricLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 1,
  },

  // Focus Card
  card: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  cardTitleIcon: {
    fontSize: 15,
  },
  cardTitle: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  focusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  focusItemCard: {
    width: "48.5%",
    backgroundColor: "#0D1626",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  focusIconText: {
    fontSize: 20,
    marginBottom: 6,
  },
  focusLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  focusValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },

  // Recent Conversations
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  viewAll: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "500",
  },
  historyScroll: {
    flexGrow: 0,
  },
  historyCard: {
    width: 185,
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  historyCardIcon: {
    fontSize: 16,
    marginBottom: 6,
  },
  historyQuestion: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  historyDate: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 6,
  },

  // Chat Bar
  chatBar: {
    backgroundColor: "#111827",
    borderRadius: 20,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  chatSparkle: {
    color: "#38BDF8",
    fontSize: 16,
    marginRight: 8,
  },
  chatPlaceholder: {
    color: "#94A3B8",
    fontSize: 14,
    flex: 1,
  },
  sendBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#00E676",
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    color: "#0B1220",
    fontSize: 16,
    fontWeight: "bold",
  },
});
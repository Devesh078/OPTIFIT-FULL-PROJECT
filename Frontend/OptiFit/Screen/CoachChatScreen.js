import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function CoachChatScreen({ route }) {
  const initialQuestion = route?.params?.question || "";
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (initialQuestion) {
      sendMessage(initialQuestion);
    }
  }, []);

  const sendMessage = async (customQuestion) => {
    const userQuestion = customQuestion || question;
    if (!userQuestion.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post("/coach/chat", { question: userQuestion });

      const coachMessage = {
        id: Date.now().toString() + "_coach",
        sender: "coach",
        text: res.data.answer || "No response",
      };

      setMessages((prev) => [...prev, coachMessage]);
    } catch (error) {
      console.log(error?.response?.data || error.message);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_error",
          sender: "coach",
          text: "Unable to contact coach right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.coachMessage,
        ]}
      >
        <Text style={[styles.messageText, { color: isUser ? "#0B1220" : "#fff" }]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Coach Chat</Text>
          <Text style={styles.subtitle}>
            Ask anything about recovery, sleep, protein or training
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#1E293B" />
              <Text style={styles.emptyText}>Ask your coach anything</Text>
            </View>
          }
        />

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingRow}>
            <View style={styles.loadingBubble}>
              <ActivityIndicator color="#00E676" size="small" />
              <Text style={styles.loadingText}>Coach is thinking...</Text>
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask Coach..."
            placeholderTextColor="#64748B"
            value={question}
            onChangeText={setQuestion}
            multiline
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendButton, !question.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!question.trim() && !loading}
          >
            <Ionicons name="send" size={20} color="#0B1220" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  header: {
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
    marginBottom: 12,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#94A3B8",
    marginTop: 6,
    fontSize: 14,
  },

  messagesList: {
    paddingVertical: 10,
    paddingBottom: 20,
  },

  messageContainer: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },

  userMessage: {
    backgroundColor: "#00E676",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },

  coachMessage: {
    backgroundColor: "#1E293B",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 22,
  },

  loadingRow: {
    paddingBottom: 10,
  },

  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    gap: 8,
  },

  loadingText: {
    color: "#94A3B8",
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },

  emptyText: {
    color: "#334155",
    fontSize: 15,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },

  input: {
    flex: 1,
    backgroundColor: "#1E293B",
    color: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 10,
    maxHeight: 120,
    fontSize: 14,
  },

  sendButton: {
    backgroundColor: "#00E676",
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },

  sendButtonDisabled: {
    backgroundColor: "#1E293B",
  },
});
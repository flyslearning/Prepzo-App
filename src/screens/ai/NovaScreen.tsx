import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { AppStackParamList } from "../../navigation/types";
import {
  askNova,
  novaConfigured,
  type NovaMessage,
} from "../../services/novaService";

type Props = NativeStackScreenProps<AppStackParamList, "Nova">;

const SUGGESTIONS = [
  "Explain a difficult topic",
  "Help me plan my revision",
  "How should I review my mistakes?",
];

export default function NovaScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const mounted = useRef(true);

  const [messages, setMessages] = useState<NovaMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [failedMessage, setFailedMessage] = useState("");

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const send = async (text = draft) => {
    const content = text.trim();
    if (!content || busyRef.current || !novaConfigured) return;

    busyRef.current = true;
    setLoading(true);
    setError("");
    setFailedMessage("");
    setDraft("");

    const previousMessages = messages;
    const nextMessages: NovaMessage[] = [
      ...previousMessages,
      { role: "user", content },
    ];
    setMessages(nextMessages);

    const controller = new AbortController();
    controllerRef.current = controller;

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 45000);

    try {
      const reply = await askNova(nextMessages, controller.signal);

      if (mounted.current) {
        setMessages([
          ...nextMessages,
          { role: "assistant", content: reply },
        ]);
      }
    } catch (caught) {
      if (mounted.current) {
        setMessages(previousMessages);
        setFailedMessage(content);
        setError(
          timedOut
            ? "Nova took too long to respond. Please retry."
            : caught instanceof Error
              ? caught.message
              : "Something went wrong. Please try again."
        );
      }
    } finally {
      clearTimeout(timer);
      controllerRef.current = null;
      busyRef.current = false;
      if (mounted.current) setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: Math.max(20, insets.left),
            paddingRight: Math.max(20, insets.right),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (messages.length) scrollRef.current?.scrollToEnd();
        }}
      >
        <View style={styles.inner}>
          <View style={styles.hero}>
            <View style={styles.novaIcon}>
              <Ionicons name="sparkles" size={31} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Hi, I’m Nova.</Text>
            <Text style={styles.subtitle}>
              What would you like to learn today?
            </Text>
          </View>

          {!novaConfigured && (
            <Text style={styles.notice}>
              Chat is coming soon. Explore your study tools below.
            </Text>
          )}

          <View style={styles.shortcuts}>
            {[
              {
                title: "Create a test",
                route: "CreateTest" as const,
                icon: "document-text-outline" as const,
              },
              {
                title: "Create a DPP",
                route: "CreateDpp" as const,
                icon: "reader-outline" as const,
              },
              {
                title: "Find questions",
                route: "SearchQuestions" as const,
                icon: "search-outline" as const,
              },
            ].map((item) => (
              <Pressable
                key={item.route}
                accessibilityRole="button"
                onPress={() => navigation.navigate(item.route)}
                style={styles.shortcut}
              >
                <Ionicons name={item.icon} size={20} color="#6754CD" />
                <Text style={styles.shortcutText}>{item.title}</Text>
                <Ionicons name="arrow-forward" size={17} color="#8B83A6" />
              </Pressable>
            ))}
          </View>

          {novaConfigured && messages.length === 0 && (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  accessibilityRole="button"
                  onPress={() => {
                    setDraft(suggestion);
                    inputRef.current?.focus();
                  }}
                  style={styles.suggestion}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {messages.map((message, index) => (
            <View
              key={`${index}-${message.role}`}
              style={[
                styles.message,
                message.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageLabel,
                  message.role === "user" && styles.white,
                ]}
              >
                {message.role === "user" ? "You" : "Nova"}
              </Text>
              <Text
                selectable
                style={[
                  styles.messageText,
                  message.role === "user" && styles.white,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator color="#7761DA" />
              <Text style={styles.subtitle}>Nova is thinking…</Text>
            </View>
          )}

          {!!error && (
            <View style={styles.errorBox}>
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={() => void send(failedMessage)}
                style={styles.retry}
              >
                <Text style={styles.retryText}>Retry message</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.composerShell,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
          },
        ]}
      >
        <View style={styles.composer}>
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            editable={novaConfigured && !loading}
            accessibilityLabel="Message Nova"
            placeholder={novaConfigured ? "Ask Nova anything…" : "Chat coming soon"}
            placeholderTextColor="#9298AA"
            multiline
            maxLength={4000}
            style={styles.input}
            textAlignVertical="top"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!novaConfigured || loading || !draft.trim()}
            onPress={() => void send()}
            style={[
              styles.sendButton,
              (!novaConfigured || loading || !draft.trim()) &&
                styles.disabled,
            ]}
          >
            <Ionicons name="arrow-up" size={23} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F9FD" },
  scroll: { flex: 1 },
  content: { paddingVertical: 24 },
  inner: { width: "100%", maxWidth: 760, alignSelf: "center" },
  hero: { alignItems: "center", marginBottom: 25 },
  novaIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: "#7761DA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },
  title: { fontSize: 27, fontWeight: "800", color: "#25203A" },
  subtitle: { fontSize: 13, color: "#817B91", marginTop: 7 },
  notice: {
    padding: 15,
    backgroundColor: "#EEEAFE",
    color: "#685889",
    borderRadius: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  shortcuts: { gap: 9 },
  shortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 17,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBE8F3",
  },
  shortcutText: { flex: 1, color: "#40384F", fontWeight: "600" },
  suggestions: { gap: 9, marginVertical: 22 },
  suggestion: {
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E4DFF2",
  },
  suggestionText: { color: "#777084", fontSize: 13 },
  message: { padding: 16, borderRadius: 19, marginTop: 16, maxWidth: "94%" },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#6754CD" },
  assistantMessage: { alignSelf: "flex-start", backgroundColor: "#FFFFFF" },
  messageLabel: { fontSize: 11, fontWeight: "800", color: "#7761DA", marginBottom: 7 },
  messageText: { fontSize: 15, lineHeight: 23, color: "#302B42" },
  white: { color: "#FFFFFF" },
  loading: { flexDirection: "row", gap: 10, alignItems: "center", padding: 18 },
  errorBox: { padding: 15, marginTop: 16, borderRadius: 15, backgroundColor: "#FFF0ED" },
  errorText: { color: "#A54F3D", lineHeight: 21 },
  retry: { paddingVertical: 13, alignSelf: "flex-start" },
  retryText: { color: "#A54F3D", fontWeight: "700" },
  composerShell: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EBE8F3",
    backgroundColor: "#FFFFFF",
  },
  composer: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 125,
    backgroundColor: "#F5F4FA",
    borderRadius: 17,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 12,
    fontSize: 15,
    color: "#302B42",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: "#7761DA",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.4 },
});
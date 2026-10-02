import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGeneratorStore } from "../../store/generatorStore";

const COLORS = {
  primary: "#2563EB",
  primarySoft: "#EDF3FF",
  title: "#17253F",
  text: "#738198",
  border: "#E7EDF6",
  background: "#F8FAFD",
  white: "#FFFFFF",
};

function getStatusStyle(status?: string | null) {
  const value = String(status || "").trim().toLowerCase();

  switch (value) {
    case "completed":
      return {
        label: "Completed",
        color: "#16816B",
        background: "#EAF7F1",
      };

    case "draft":
      return {
        label: "Draft",
        color: "#9A7524",
        background: "#FFF7E4",
      };

    case "in_progress":
    case "in progress":
      return {
        label: "In progress",
        color: "#7955BB",
        background: "#F2ECFC",
      };

    default:
      return {
        label: value
          ? value
              .replace(/[_-]+/g, " ")
              .replace(/\b\w/g, (letter) => letter.toUpperCase())
          : "Saved",
        color: COLORS.primary,
        background: COLORS.primarySoft,
      };
  }
}

export default function MyTestsScreen({
  navigation,
  route,
}: any) {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();

  const tests = useGeneratorStore((state) => state.tests);
  const loadMyTests = useGeneratorStore((state) => state.loadMyTests);

  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const mounted = useRef(true);
  const requestRunning = useRef(false);

  const testList = tests ?? [];

  // "Test" is your bottom tab; "MyTests" is your stack route.
  const insideTab = route?.name === "Test";

  const loadTests = useCallback(async () => {
    if (requestRunning.current) return;

    requestRunning.current = true;

    if (mounted.current) {
      setRefreshing(true);
      setError("");
    }

    try {
      await loadMyTests();
    } catch {
      if (mounted.current) {
        setError("Couldn’t load your tests. Please try again.");
      }
    } finally {
      requestRunning.current = false;

      if (mounted.current) {
        setRefreshing(false);
        setInitialLoading(false);
      }
    }
  }, [loadMyTests]);

  useEffect(() => {
    mounted.current = true;
    void loadTests();

    return () => {
      mounted.current = false;
    };
  }, [loadTests]);

  const generateTest = () => {
    navigation.navigate("CreateTest");
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insideTab ? insets.top : 0,
          paddingLeft: Math.max(insets.left, 18),
          paddingRight: Math.max(insets.right, 18),
        },
      ]}
    >
      <View style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" style={styles.title}>
              My Tests
            </Text>

            <Text style={styles.subtitle}>
              Your preparation, one test at a time.
            </Text>
          </View>

          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.headerIcon}
          >
            <Ionicons
              name="documents-outline"
              size={26}
              color={COLORS.primary}
            />
          </View>
        </View>

        <FlatList
          style={styles.list}
          data={testList}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: insideTab
                ? 56
                : Math.max(insets.bottom, 20),
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing && !initialLoading}
              onRefresh={() => void loadTests()}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Generate Test */}
              <View style={styles.generateCard}>
                <View style={styles.generateTop}>
                  <View style={styles.generateIcon}>
                    <Ionicons
                      name="add"
                      size={26}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.flex}>
                    <Text style={styles.generateTitle}>
                      Your next challenge
                    </Text>

                    <Text style={styles.generateDescription}>
                      Create a test for what you want to practise.
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Generate a new test"
                  onPress={generateTest}
                  style={({ pressed }) => [
                    styles.generateButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text style={styles.generateButtonText}>
                    Generate Test
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <Text accessibilityRole="alert" style={styles.errorText}>
                    {error}
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    disabled={refreshing}
                    onPress={() => void loadTests()}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryText}>
                      {refreshing ? "Retrying…" : "Retry"}
                    </Text>
                  </Pressable>
                </View>
              )}

              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Your collection</Text>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {testList.length}
                  </Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            initialLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.loadingText}>
                  Loading your tests…
                </Text>
              </View>
            ) : error ? null : (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={38}
                    color="#8EADE8"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  Your first test starts here
                </Text>

                <Text style={styles.emptyDescription}>
                  Tap Generate Test above to create your first practice set.
                </Text>
              </View>
            )
          }
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          renderItem={({ item }) => {
            const status = getStatusStyle(item.status);

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title || "Prepzo Test"}`}
                onPress={() =>
                  navigation.navigate("TestAttempt", {
                    testId: item.id,
                  })
                }
                style={({ pressed }) => [
                  styles.testCard,
                  pressed && styles.testCardPressed,
                ]}
              >
                <View
                  style={[
                    styles.cardTop,
                    fontScale > 1.4 && styles.cardTopStacked,
                  ]}
                >
                  <View style={styles.testIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color={COLORS.primary}
                    />
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: status.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: status.color },
                      ]}
                    >
                      {status.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.testTitle}>
                  {item.title || "Prepzo Test"}
                </Text>

                <View style={styles.metadata}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="layers-outline"
                      size={15}
                      color="#8491A5"
                    />

                    <Text style={styles.metaText}>
                      {item.total_questions ?? "—"} questions
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="#8491A5"
                    />

                    <Text style={styles.metaText}>
                      {item.time_minutes ?? "—"} min
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.openText}>Open test</Text>

                  <View style={styles.openArrow}>
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={COLORS.primary}
                    />
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  page: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },

  flex: {
    flex: 1,
    minWidth: 0,
  },

  header: {
    paddingTop: 18,
    paddingBottom: 21,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: COLORS.title,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.text,
  },

  headerIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    flex: 1,
  },

  listContent: {
    flexGrow: 1,
  },

  generateCard: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#EDF3FF",
    borderWidth: 1,
    borderColor: "#E0EAFD",
  },

  generateTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  generateIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  generateTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: COLORS.title,
  },

  generateDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 19,
    color: "#6D80A0",
  },

  generateButton: {
    marginTop: 18,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  generateButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.85,
  },

  sectionHeading: {
    marginTop: 26,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  sectionTitle: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: COLORS.title,
  },

  countBadge: {
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    backgroundColor: "#EAF0FA",
    alignItems: "center",
  },

  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B80A2",
  },

  separator: {
    height: 12,
  },

  testCard: {
    padding: 18,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  testCardPressed: {
    backgroundColor: "#F3F7FF",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  cardTopStacked: {
    flexDirection: "column",
    alignItems: "flex-start",
  },

  testIcon: {
    width: 42,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F0F5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadge: {
    flexShrink: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  testTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: COLORS.title,
  },

  metadata: {
    marginTop: 11,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 17,
    rowGap: 9,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    fontSize: 12,
    color: COLORS.text,
  },

  cardFooter: {
    marginTop: 17,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F0F3F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  openText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  openArrow: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  loading: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 12,
    color: COLORS.text,
  },

  empty: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 38,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 27,
    backgroundColor: "#EDF3FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.title,
  },

  emptyDescription: {
    maxWidth: 280,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    color: COLORS.text,
  },

  errorBox: {
    marginTop: 15,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#FFF2EC",
  },

  errorText: {
    fontSize: 12,
    lineHeight: 19,
    color: "#A15C37",
  },

  retryButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  retryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A15C37",
  },
});
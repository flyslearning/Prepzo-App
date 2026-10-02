import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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

import { GeneratorApi } from "../../api/generatorApi";
import { useGeneratorStore } from "../../store/generatorStore";

const BLUE = "#2563EB";

function displayLabel(value?: string | null) {
  const text = value?.trim().replace(/[_-]+/g, " ");

  return text
    ? text.charAt(0).toUpperCase() + text.slice(1)
    : "Saved";
}

function statusColors(value?: string | null) {
  const status = value
    ?.trim()
    .toLowerCase()
    .replace(/[ -]+/g, "_");

  switch (status) {
    case "completed":
      return {
        backgroundColor: "#EAF8F0",
        color: "#218458",
      };

    case "draft":
      return {
        backgroundColor: "#FFF5E3",
        color: "#986B19",
      };

    case "in_progress":
      return {
        backgroundColor: "#F1ECFC",
        color: "#7754B5",
      };

    default:
      return {
        backgroundColor: "#EDF3FF",
        color: BLUE,
      };
  }
}

export default function MyDppsScreen({
  navigation,
  route,
}: any) {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();

  const dpps = useGeneratorStore((state) => state.dpps);
  const loadMyDpps = useGeneratorStore(
    (state) => state.loadMyDpps
  );

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [openingId, setOpeningId] = useState<string | null>(
    null
  );

  const mounted = useRef(false);
  const listBusy = useRef(false);
  const detailBusy = useRef(false);

  // Your bottom-tab route is named "Dpp".
  const insideTab = route?.name === "Dpp";

  const refresh = useCallback(async () => {
    if (listBusy.current) return;

    listBusy.current = true;
    setRefreshing(true);
    setError("");

    try {
      await loadMyDpps();
    } catch {
      if (mounted.current) {
        setError(
          "Couldn't refresh your DPPs. Please try again."
        );
      }
    } finally {
      listBusy.current = false;

      if (mounted.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, [loadMyDpps]);

  useEffect(() => {
    mounted.current = true;
    void refresh();

    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  const openDpp = async (id: string) => {
    if (detailBusy.current) return;

    detailBusy.current = true;
    setOpeningId(id);

    try {
      const res = await GeneratorApi.getDppDetail(id);

      if (!mounted.current || !navigation.isFocused()) {
        return;
      }

      const questions = res.data?.questions;

      if (
        !Array.isArray(questions) ||
        questions.length === 0
      ) {
        Alert.alert(
          "No questions yet",
          "This DPP doesn't have any questions available yet."
        );
        return;
      }

      navigation.navigate("DppAttempt", {
        dppId: id,
        questions,
      });
    } catch {
      if (mounted.current && navigation.isFocused()) {
        Alert.alert(
          "Couldn't open DPP",
          "Please check your connection and try again."
        );
      }
    } finally {
      detailBusy.current = false;

      if (mounted.current) {
        setOpeningId(null);
      }
    }
  };

  return (
    <View
      style={[
        s.screen,
        {
          paddingTop: insideTab ? insets.top : 0,
          paddingLeft: Math.max(insets.left, 18),
          paddingRight: Math.max(insets.right, 18),
        },
      ]}
    >
      <View style={s.page}>
        <FlatList
          data={dpps ?? []}
          keyExtractor={(item) => String(item.id)}
          extraData={openingId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.content,
            {
              paddingBottom: insideTab
                ? 56
                : Math.max(insets.bottom + 16, 28),
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing && !initialLoading}
              onRefresh={() => void refresh()}
              tintColor={BLUE}
              colors={[BLUE]}
            />
          }
          ListHeaderComponent={
            <>
              {/* Page heading */}
              <View style={s.heading}>
                <View style={s.flex}>
                  <Text
                    accessibilityRole="header"
                    style={s.title}
                  >
                    My DPPs
                  </Text>

                  <Text style={s.subtitle}>
                    Small practice. Stronger every day.
                  </Text>
                </View>

                <View style={s.headerIcon}>
                  <Ionicons
                    name="layers-outline"
                    size={25}
                    color={BLUE}
                  />
                </View>
              </View>

              {/* Generate DPP */}
              <View style={s.hero}>
                <View style={s.heroTop}>
                  <View style={s.heroIcon}>
                    <Ionicons
                      name="flash-outline"
                      size={24}
                      color={BLUE}
                    />
                  </View>

                  <View style={s.flex}>
                    <Text style={s.eyebrow}>
                      MAKE PRACTICE A HABIT
                    </Text>

                    <Text style={s.heroTitle}>
                      A little progress, daily.
                    </Text>
                  </View>
                </View>

                <Text style={s.heroCopy}>
                  Create a fresh set of questions and make
                  time for what you want to improve.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Generate DPP"
                  onPress={() =>
                    navigation.navigate("CreateDpp")
                  }
                  style={({ pressed }) => [
                    s.generate,
                    pressed && s.generatePressed,
                  ]}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text style={s.generateText}>
                    Generate DPP
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              <View style={s.note}>
                <Ionicons
                  name="sunny-outline"
                  size={18}
                  color="#A98037"
                />

                <Text style={s.noteText}>
                  One focused session can make today count.
                </Text>
              </View>

              {/* Refresh error */}
              {error ? (
                <View
                  style={s.error}
                  accessibilityLiveRegion="polite"
                >
                  <Text style={s.errorText}>{error}</Text>

                  <Pressable
                    accessibilityRole="button"
                    disabled={refreshing}
                    onPress={() => void refresh()}
                    style={s.retry}
                  >
                    <Text style={s.retryText}>
                      {refreshing
                        ? "Retrying…"
                        : "Try again"}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={s.collection}>
                <Text
                  accessibilityRole="header"
                  style={s.sectionTitle}
                >
                  Your collection
                </Text>

                <Text style={s.count}>
                  {dpps?.length ?? 0}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            initialLoading ? (
              <View style={s.empty}>
                <ActivityIndicator
                  size="large"
                  color={BLUE}
                />

                <Text style={s.emptyCopy}>
                  Loading your practice sets…
                </Text>
              </View>
            ) : error ? null : (
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Ionicons
                    name="book-outline"
                    size={35}
                    color={BLUE}
                  />
                </View>

                <Text style={s.emptyTitle}>
                  Start your daily practice
                </Text>

                <Text style={s.emptyCopy}>
                  Your DPPs will appear here. Tap Generate
                  DPP above to create your first set.
                </Text>
              </View>
            )
          }
          ItemSeparatorComponent={() => (
            <View style={{ height: 12 }} />
          )}
          renderItem={({ item }) => {
            const opening = openingId === item.id;
            const status = statusColors(item.status);

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${
                  item.title || "Daily DPP"
                }`}
                accessibilityState={{
                  disabled: openingId !== null,
                  busy: opening,
                }}
                disabled={openingId !== null}
                onPress={() => void openDpp(item.id)}
                style={({ pressed }) => [
                  s.card,
                  pressed && s.cardPressed,
                  opening && s.cardOpening,
                ]}
              >
                <View
                  style={[
                    s.cardTop,
                    fontScale > 1.4 && s.stacked,
                  ]}
                >
                  <View style={s.documentIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={23}
                      color={BLUE}
                    />
                  </View>

                  <Text style={[s.status, status]}>
                    {displayLabel(item.status)}
                  </Text>
                </View>

                <Text style={s.cardTitle}>
                  {item.title || "Daily DPP"}
                </Text>

                <View style={s.metadata}>
                  <View style={s.metaItem}>
                    <Ionicons
                      name="list-outline"
                      size={16}
                      color="#7B879A"
                    />

                    <Text style={s.metaText}>
                      {item.total_questions ?? "—"} questions
                    </Text>
                  </View>

                  {item.mode ? (
                    <View style={s.metaItem}>
                      <Ionicons
                        name="options-outline"
                        size={16}
                        color="#7B879A"
                      />

                      <Text style={s.metaText}>
                        {displayLabel(item.mode)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={s.cardFooter}>
                  <Text style={s.openText}>
                    {opening
                      ? "Opening your DPP…"
                      : "Open practice set"}
                  </Text>

                  <View style={s.arrow}>
                    {opening ? (
                      <ActivityIndicator
                        color={BLUE}
                        size="small"
                      />
                    ) : (
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color={BLUE}
                      />
                    )}
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

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFD",
  },

  page: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },

  content: {
    flexGrow: 1,
    paddingTop: 20,
  },

  flex: {
    flex: 1,
    minWidth: 0,
  },

  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#17253F",
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 19,
    color: "#738198",
  },

  headerIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor: "#EDF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  hero: {
    padding: 19,
    borderRadius: 24,
    backgroundColor: "#EDF4FF",
    borderWidth: 1,
    borderColor: "#DEE9FC",
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  heroIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#6585B7",
    marginBottom: 5,
  },

  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: "#203D6A",
  },

  heroCopy: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 21,
    color: "#697E9E",
  },

  generate: {
    marginTop: 19,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: BLUE,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  generatePressed: {
    backgroundColor: "#1D4ED8",
  },

  generateText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  note: {
    paddingVertical: 17,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  noteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: "#8B816E",
  },

  collection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 15,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#17253F",
    letterSpacing: -0.3,
  },

  count: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
    fontSize: 12,
    fontWeight: "700",
    color: "#647894",
    backgroundColor: "#EAF0F8",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#E7EDF6",
  },

  cardPressed: {
    backgroundColor: "#F3F7FE",
  },

  cardOpening: {
    borderColor: "#AFCBFF",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },

  stacked: {
    flexDirection: "column",
    alignItems: "flex-start",
  },

  documentIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#F0F5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  status: {
    flexShrink: 1,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "600",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#23324A",
    letterSpacing: -0.35,
  },

  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 11,
  },

  metaItem: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    flexShrink: 1,
    color: "#7B879A",
    fontSize: 12,
    lineHeight: 19,
  },

  cardFooter: {
    marginTop: 17,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F0F3F8",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  openText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: BLUE,
  },

  arrow: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#EDF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 42,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 27,
    backgroundColor: "#EDF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#23324A",
    textAlign: "center",
  },

  emptyCopy: {
    marginTop: 10,
    maxWidth: 300,
    fontSize: 13,
    lineHeight: 21,
    color: "#7B879A",
    textAlign: "center",
  },

  error: {
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#FFF1F1",
    marginBottom: 8,
  },

  errorText: {
    color: "#AD4545",
    fontSize: 12,
    lineHeight: 19,
  },

  retry: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  retryText: {
    color: "#AD4545",
    fontSize: 12,
    fontWeight: "700",
  },
});
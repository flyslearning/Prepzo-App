import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AccessibilityInfo,
  Animated,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import type { StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type {
  AppStackParamList,
  BottomTabParamList,
} from "../../navigation/types";

import { useAuthStore } from "../../store/authStore";
import { useGeneratorStore } from "../../store/generatorStore";
import HomeBannerCarousel from "../../components/home/HomeBannerCarousel";
import Launchingsliding from "../../components/home/Launchingsliding";
import NovaCard from "../../components/home/NovaCard";

// Same path as your attached code.
const LOGO = require("../../assets/images/logo.png");

const C = {
  blue: "#2563EB",
  navy: "#17253F",
  muted: "#748198",
  line: "#E9EDF5",
  teal: "#087F87",
  purple: "#7555CD",
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "Home">,
  NativeStackScreenProps<AppStackParamList>
>;

const MotionContext = createContext(true);

/* Reusable animated button */

function Action({
  children,
  label,
  onPress,
  style,
  outerStyle,
}: {
  children: React.ReactNode;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  outerStyle?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useContext(MotionContext);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scale.stopAnimation();
    scale.setValue(1);
    return () => scale.stopAnimation();
  }, [reduceMotion, scale]);

  const animate = (value: number) => {
    if (reduceMotion) return;

    scale.stopAnimation();

    Animated.spring(scale, {
      toValue: value,
      stiffness: 340,
      damping: 25,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[outerStyle, { transform: [{ scale }] }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onPressIn={() => animate(0.97)}
        onPressOut={() => animate(1)}
        style={({ pressed }) => [
          style,
          pressed && { opacity: 0.86 },
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function Heading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={s.heading}>
      <Text accessibilityRole="header" style={s.headingTitle}>
        {title}
      </Text>
      {!!subtitle && <Text style={s.headingSubtitle}>{subtitle}</Text>}
    </View>
  );
}

/* Quick action / practice card */

function StudyCard({
  title,
  subtitle,
  icon,
  width,
  color,
  background,
  count,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  width: number;
  color: string;
  background: string;
  count?: number;
  onPress: () => void;
}) {
  const isPractice = count !== undefined;

  return (
    <Action
      label={
        isPractice
          ? `${title}, ${count} ${subtitle}`
          : title
      }
      onPress={onPress}
      outerStyle={{ width }}
      style={[
        s.studyCard,
        { backgroundColor: background },
        isPractice && s.practiceCard,
      ]}
    >
      <View style={s.between}>
        <View
          style={[
            s.cardIcon,
            isPractice && { backgroundColor: `${color}12` },
          ]}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>

        <View style={s.cardArrow}>
          <Ionicons name="arrow-forward" size={17} color={color} />
        </View>
      </View>

      {isPractice && (
        <Text style={[s.count, { color }]}>{count}</Text>
      )}

      <Text
        style={[
          s.cardTitle,
          !isPractice && { marginTop: 20 },
        ]}
      >
        {title}
      </Text>

      <Text style={s.cardSubtitle}>{subtitle}</Text>

      {!isPractice && (
        <View style={[s.cardAccent, { backgroundColor: color }]} />
      )}
    </Action>
  );
}

/* Open feature row */

function ToolRow({
  title,
  subtitle,
  icon,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  onPress: () => void;
}) {
  return (
    <Action label={title} onPress={onPress} style={s.toolRow}>
      <Ionicons name={icon} size={25} color={color} />

      <View style={s.flex}>
        <Text style={s.toolTitle}>{title}</Text>
        <Text style={s.toolSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="arrow-forward" size={19} color="#8A97AC" />
    </Action>
  );
}

/* Home */

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();

  const [layoutWidth, setLayoutWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const mounted = useRef(true);
  const loading = useRef(false);

  const user = useAuthStore((state) => state.user);

  const tests = useGeneratorStore((state) => state.tests);
  const dpps = useGeneratorStore((state) => state.dpps);
  const notifications = useGeneratorStore((state) => state.notifications);

  const loadMyTests = useGeneratorStore((state) => state.loadMyTests);
  const loadMyDpps = useGeneratorStore((state) => state.loadMyDpps);
  const loadNotifications = useGeneratorStore(
    (state) => state.loadNotifications
  );

  const left = Math.max(18, insets.left);
  const right = Math.max(18, insets.right);

  const contentWidth =
    layoutWidth || Math.max(1, Math.min(760, width - left - right));

  const singleColumn = contentWidth < 310 || fontScale > 1.35;

  const cardWidth = singleColumn
    ? contentWidth
    : Math.floor((contentWidth - 12) / 2);

  const shortcutColumns =
    fontScale > 1.8 ? 1 : contentWidth < 330 || fontScale > 1.2 ? 2 : 4;

  const shortcutWidth = Math.floor(contentWidth / shortcutColumns);
  const wrapHeader = contentWidth < 300 || fontScale > 1.4;

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const refresh = useCallback(async () => {
    if (loading.current) return;

    loading.current = true;

    if (mounted.current) {
      setRefreshing(true);
      setError("");
    }

    try {
      const results = await Promise.allSettled([
        Promise.resolve().then(() => loadMyTests()),
        Promise.resolve().then(() => loadMyDpps()),
        Promise.resolve().then(() => loadNotifications()),
      ]);

      if (
        mounted.current &&
        results.some((result) => result.status === "rejected")
      ) {
        setError("Some updates couldn’t load. Pull down to retry.");
      }
    } finally {
      loading.current = false;
      if (mounted.current) setRefreshing(false);
    }
  }, [loadMyTests, loadMyDpps, loadNotifications]);

  useEffect(() => {
    mounted.current = true;
    void refresh();

    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  const learningTools: {
    title: string;
    icon: IconName;
    color: string;
    background: string;
    onPress: () => void;
  }[] = [
    {
      title: "Question Bank",
      icon: "search-outline",
      color: C.blue,
      background: "#EDF3FF",
      onPress: () => navigation.navigate("SearchQuestions"),
    },
    {
      title: "Mistake Book",
      icon: "refresh-outline",
      color: "#C27749",
      background: "#FFF1E7",
      onPress: () => navigation.navigate("Mistakes"),
    },
    {
      title: "Bookmarks",
      icon: "bookmark-outline",
      color: "#AA8228",
      background: "#FFF6DF",
      onPress: () => navigation.navigate("Bookmarks"),
    },
    {
      title: "Revision",
      icon: "folder-open-outline",
      color: C.purple,
      background: "#F1ECFC",
      onPress: () => navigation.navigate("RevisionFolder"),
    },
  ];

  return (
    <MotionContext.Provider value={reduceMotion}>
      <View style={s.screen}>
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingLeft: left,
            paddingRight: right,
            paddingBottom: 56,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              colors={[C.blue]}
              tintColor={C.blue}
              progressViewOffset={insets.top}
            />
          }
        >
          <View
            style={s.content}
            onLayout={(event) => {
              const next = event.nativeEvent.layout.width;
              setLayoutWidth((previous) =>
                Math.abs(previous - next) > 0.5 ? next : previous
              );
            }}
          >
            {/* Compact header */}
            <View
              style={[
                s.header,
                wrapHeader && s.headerWrapped,
              ]}
            >
              <View style={s.identity}>
                <Image
                  source={LOGO}
                  style={s.logo}
                  resizeMode="contain"
                  accessibilityLabel="Prepzo logo"
                />

                <View style={s.flex}>
                  <Text style={s.greeting}>
                    Hello,{" "}
                    <Text style={s.name}>
                      {user?.firstName?.trim() || "Learner"}
                    </Text>
                  </Text>

                  <Text style={s.tagline}>
                    A little better, every day.
                  </Text>
                </View>
              </View>

              <View style={s.headerActions}>
                <Action
                  label="Open settings"
                  onPress={() => navigation.navigate("Settings")}
                  style={s.headerButton}
                >
                  <Ionicons
                    name="settings-outline"
                    size={21}
                    color={C.navy}
                  />
                </Action>

                <Action
                  label="Open notifications"
                  onPress={() => navigation.navigate("Notifications")}
                  style={s.headerButton}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={21}
                    color={C.navy}
                  />

                  {(notifications?.length ?? 0) > 0 && (
                    <View style={s.notificationDot} />
                  )}
                </Action>
              </View>
            </View>

            {/* Existing slider */}
            <HomeBannerCarousel
              onOpen={(route) => navigation.navigate(route)}
            />
            <Launchingsliding />

            {!!error && (
              <Text accessibilityRole="alert" style={s.error}>
                {error}
              </Text>
            )}

            {/* Two primary actions */}
            <Heading title="Quick actions" />

            <View style={s.cardGrid}>
              <StudyCard
                title="Create Test"
                subtitle="Build your next challenge."
                icon="document-text-outline"
                width={cardWidth}
                color={C.blue}
                background="#EBF2FF"
                onPress={() => navigation.navigate("CreateTest")}
              />

              <StudyCard
                title="Create DPP"
                subtitle="Make daily practice count."
                icon="layers-outline"
                width={cardWidth}
                color={C.teal}
                background="#EAF7F4"
                onPress={() => navigation.navigate("CreateDpp")}
              />
            </View>

            {/* Nova */}
            <NovaCard onPress={() => navigation.navigate("Nova")} />

            {/* Practice */}
            <Heading
              title="Your practice"
              subtitle="Everything you’ve created, ready when you are."
            />

            <View style={s.cardGrid}>
              <StudyCard
                title="My Tests"
                subtitle="saved tests"
                count={tests?.length ?? 0}
                icon="documents-outline"
                width={cardWidth}
                color={C.blue}
                background="#FCFDFF"
                onPress={() => navigation.navigate("Test")}
              />

              <StudyCard
                title="My DPPs"
                subtitle="practice sets"
                count={dpps?.length ?? 0}
                icon="reader-outline"
                width={cardWidth}
                color={C.teal}
                background="#FCFDFF"
                onPress={() => navigation.navigate("Dpp")}
              />
            </View>

            {/* Open shortcuts */}
            <View style={s.divider} />

            <Heading
              title="Learn from every attempt"
              subtitle="Explore. Review. Remember."
            />

            <View style={s.learningGrid}>
              {learningTools.map((tool) => (
                <Action
                  key={tool.title}
                  label={tool.title}
                  onPress={tool.onPress}
                  outerStyle={{ width: shortcutWidth }}
                  style={s.learningItem}
                >
                  <View
                    style={[
                      s.learningCircle,
                      { backgroundColor: tool.background },
                    ]}
                  >
                    <Ionicons
                      name={tool.icon}
                      size={25}
                      color={tool.color}
                    />
                  </View>

                  <Text style={s.learningText}>{tool.title}</Text>
                </Action>
              ))}
            </View>

            {/* Open rows */}
            <Heading title="Go a step further" />

            <ToolRow
              title="Smart Generator"
              subtitle="Weak-topic tests and adaptive DPPs."
              icon="flash-outline"
              color={C.purple}
              onPress={() => navigation.navigate("AdvancedGenerator")}
            />

            <ToolRow
              title="Leaderboard"
              subtitle="Explore student rankings."
              icon="trophy-outline"
              color="#B78C31"
              onPress={() => navigation.navigate("Leaderboard")}
            />

            {/* Community */}
            <Heading
              title="Better, together."
              subtitle="Find your batch. Share your practice."
            />

            <View style={s.community}>
              <View style={s.communityHeading}>
                <Ionicons
                  name="people-outline"
                  size={27}
                  color={C.teal}
                />

                <View style={s.flex}>
                  <Text style={s.communityTitle}>Your study circle</Text>
                  <Text style={s.communitySubtitle}>
                    Join your batch with a code.
                  </Text>
                </View>
              </View>

              <Action
                label="Join batch"
                onPress={() => navigation.navigate("JoinBatch")}
                outerStyle={s.joinOuter}
                style={s.joinButton}
              >
                <Text style={s.joinText}>Join batch</Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
              </Action>
            </View>

            <Action
              label="Explore shared tests"
              onPress={() => navigation.navigate("SharedTest")}
              style={s.sharedLink}
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color={C.blue}
              />

              <Text style={s.sharedText}>Explore shared tests</Text>

              <Ionicons name="arrow-forward" size={18} color={C.blue} />
            </Action>

            {/* Footer */}
            <View style={s.footer}>
              <View style={s.footerLine} />

              <Text style={s.footerLove}>
                With ❤️ from{" "}
                <Text style={s.footerBrand}>Prepzo</Text>
              </Text>

              <Text style={s.footerCredit}>
                Created by the{" "}
                <Text style={s.footerTeam}>Soinech team</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </MotionContext.Provider>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  flex: { flex: 1, minWidth: 0 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 15,
  },
  headerWrapped: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  identity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  logo: { width: 37, height: 40 },
  greeting: {
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: -0.4,
    color: C.navy,
  },
  name: { fontWeight: "800", color: C.navy },
  tagline: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: C.muted,
  },
  headerActions: {
    flexDirection: "row",
    alignSelf: "flex-end",
    gap: 5,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#F6F8FC",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EB767C",
  },

  heading: { marginTop: 23, marginBottom: 13 },
  headingTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: C.navy,
  },
  headingSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  studyCard: {
    flexGrow: 1,
    padding: 17,
    borderRadius: 22,
  },
  cardIcon: {
    width: 44,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardArrow: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: C.navy,
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: "#6E7B91",
  },
  cardAccent: {
    width: 25,
    height: 3,
    borderRadius: 2,
    marginTop: 16,
    opacity: 0.5,
  },
  practiceCard: {
    borderWidth: 1,
    borderColor: C.line,
  },
  count: {
    marginTop: 14,
    marginBottom: 5,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },

  novaOuter: { marginTop: 22 },
  nova: {
    padding: 17,
    borderRadius: 23,
    backgroundColor: "#F1EDFC",
    overflow: "hidden",
  },
  novaDecoration: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 22,
    borderColor: "#E7E0F9",
    top: -108,
    right: -65,
  },
  novaTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  novaIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: "#7B5FD1",
    alignItems: "center",
    justifyContent: "center",
  },
  novaTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 7,
  },
  novaTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#382957",
  },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 9,
    fontWeight: "800",
    color: "#7557B8",
    backgroundColor: "#E3DAF8",
  },
  novaSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#827296",
  },
  novaSearch: {
    marginTop: 16,
    padding: 10,
    paddingLeft: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  novaPlaceholder: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#817695",
  },
  novaArrow: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: "#7B5FD1",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    marginTop: 27,
    height: 1,
    backgroundColor: C.line,
  },
  learningGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 13,
  },
  learningItem: {
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 5,
  },
  learningCircle: {
    width: 57,
    height: 57,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  learningText: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "center",
    color: "#53617A",
  },

  toolRow: {
    minHeight: 78,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.navy,
  },
  toolSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
  },

  community: {
    paddingLeft: 16,
    paddingVertical: 7,
    borderLeftWidth: 3,
    borderLeftColor: "#BBDDD5",
  },
  communityHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.navy,
  },
  communitySubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
  },
  joinOuter: {
    alignSelf: "flex-start",
    marginTop: 15,
  },
  joinButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.teal,
  },
  joinText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sharedLink: {
    marginTop: 15,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  sharedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.blue,
  },

  footer: {
    marginTop: 29,
    paddingTop: 24,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: C.line,
    alignItems: "center",
  },
  footerLine: {
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#D1DFFC",
    marginBottom: 15,
  },
  footerLove: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    color: "#7D899D",
  },
  footerBrand: {
    fontWeight: "800",
    color: C.blue,
  },
  footerCredit: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    color: "#919CAD",
  },
  footerTeam: {
    fontWeight: "700",
    color: "#67788E",
  },
  error: {
    paddingVertical: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#A36336",
  },
});
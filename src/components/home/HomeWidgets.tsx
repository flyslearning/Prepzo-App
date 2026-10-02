import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const HOME_COLORS = {
  primary: "#2563EB",
  ink: "#14213D",
  muted: "#758198",
  border: "#E8EDF5",
  background: "#F6F8FC",
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export type HomeTool = {
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  background: string;
  onPress: () => void;
};

export function HomeTopBar({
  name,
  notificationCount,
  onSettings,
  onNotifications,
}: {
  name?: string;
  notificationCount: number;
  onSettings: () => void;
  onNotifications: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="school" size={23} color="#FFFFFF" />
        </View>

        <View style={styles.brandText}>
          <Text style={styles.brandName}>Prepzo</Text>
          <Text numberOfLines={1} style={styles.greeting}>
            Hello, {name?.trim() || "Learner"}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        onPress={onSettings}
        style={({ pressed }) => [
          styles.headerButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="settings-outline" size={22} color={HOME_COLORS.ink} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Notifications, ${notificationCount} updates`}
        onPress={onNotifications}
        style={({ pressed }) => [
          styles.headerButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="notifications-outline"
          size={22}
          color={HOME_COLORS.ink}
        />
        {notificationCount > 0 && <View style={styles.notificationDot} />}
      </Pressable>
    </View>
  );
}

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

export function QuickActions({
  onCreateTest,
  onCreateDpp,
}: {
  onCreateTest: () => void;
  onCreateDpp: () => void;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 340 || fontScale > 1.35;

  const actions: HomeTool[] = [
    {
      title: "Create Test",
      subtitle: "Build your next challenge",
      icon: "document-text-outline",
      color: "#2563EB",
      background: "#EAF1FF",
      onPress: onCreateTest,
    },
    {
      title: "Create DPP",
      subtitle: "Make daily practice count",
      icon: "layers-outline",
      color: "#087F8C",
      background: "#E7F7F6",
      onPress: onCreateDpp,
    },
  ];

  return (
    <View style={[styles.quickRow, stacked && styles.stacked]}>
      {actions.map((item) => (
        <Pressable
          key={item.title}
          accessibilityRole="button"
          onPress={item.onPress}
          style={({ pressed }) => [
            styles.quickCard,
            { backgroundColor: item.background },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.quickTop}>
            <View style={styles.quickIcon}>
              <Ionicons name={item.icon} size={25} color={item.color} />
            </View>
            <Ionicons name="arrow-forward" size={19} color={item.color} />
          </View>
          <Text style={styles.quickTitle}>{item.title}</Text>
          <Text style={styles.quickSubtitle}>{item.subtitle}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function NovaSearchBox({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open Nova AI assistant"
      onPress={onPress}
      style={({ pressed }) => [
        styles.novaCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.novaTop}>
        <View style={styles.novaIcon}>
          <Ionicons name="sparkles" size={23} color="#FFFFFF" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.novaTitle}>Meet Nova</Text>
          <Text style={styles.novaSubtitle}>Your AI study assistant</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#6758CD" />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#8A85A3" />
        <Text style={styles.searchText}>Ask a doubt. Explore a topic.</Text>
      </View>
    </Pressable>
  );
}

export function ToolSection({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: HomeTool[];
}) {
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 360 || fontScale > 1.3;

  return (
    <View>
      <SectionHeading title={title} subtitle={subtitle} />

      <View style={styles.toolGrid}>
        {items.map((item) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.toolCard,
              { width: singleColumn ? "100%" : "48.5%" },
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: item.background },
              ]}
            >
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>

            <View style={styles.flex}>
              <Text style={styles.toolTitle}>{item.title}</Text>
              <Text style={styles.toolSubtitle}>{item.subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={15} color="#A1ABBD" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.72 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  brand: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  brandText: { flex: 1, minWidth: 0 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: HOME_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 21,
    fontWeight: "800",
    color: HOME_COLORS.ink,
    letterSpacing: -0.7,
  },
  greeting: {
    fontSize: 12,
    color: HOME_COLORS.muted,
    marginTop: 2,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF6464",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  sectionHeading: { marginTop: 25, marginBottom: 13 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: HOME_COLORS.ink,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: HOME_COLORS.muted,
    marginTop: 4,
  },

  quickRow: { flexDirection: "row", gap: 12 },
  stacked: { flexDirection: "column" },
  quickCard: {
    flex: 1,
    padding: 17,
    borderRadius: 23,
    minWidth: 0,
  },
  quickTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: HOME_COLORS.ink,
  },
  quickSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginTop: 6,
  },

  novaCard: {
    marginTop: 22,
    borderRadius: 24,
    padding: 17,
    backgroundColor: "#F0EDFF",
    borderWidth: 1,
    borderColor: "#E5DFFF",
  },
  novaTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  novaIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#7761DA",
    alignItems: "center",
    justifyContent: "center",
  },
  novaTitle: { fontSize: 18, fontWeight: "800", color: "#302455" },
  novaSubtitle: { fontSize: 12, color: "#807399", marginTop: 3 },
  searchBox: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchText: { flex: 1, fontSize: 13, color: "#8A85A3" },

  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  toolCard: {
    padding: 13,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minHeight: 91,
  },
  toolIcon: {
    width: 35,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  toolTitle: { fontSize: 13, fontWeight: "700", color: HOME_COLORS.ink },
  toolSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: HOME_COLORS.muted,
    marginTop: 4,
  },
});
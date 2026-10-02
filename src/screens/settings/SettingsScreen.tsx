import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { AppStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";

type Props = NativeStackScreenProps<AppStackParamList, "Settings">;
type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const confirmLogout = () => {
    Alert.alert("Log out?", "You can sign in again anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          setLoggingOut(true);

          Promise.resolve()
            .then(() => logout())
            .catch(() => {
              setLoggingOut(false);
              Alert.alert("Could not log out", "Please try again.");
            });
        },
      },
    ]);
  };

  const openDeleteAccount = async () => {
    try {
      await Linking.openURL("https://www.flyslearning.com/deleteaccount");
    } catch {
      Alert.alert(
        "Unable to open page",
        "Please visit https://www.flyslearning.com/deleteaccount"
      );
    }
  };

  const rows: {
    title: string;
    subtitle: string;
    icon: IconName;
    destructive?: boolean;
    onPress: () => void;
  }[] = [
    {
      title: "My profile",
      subtitle: "View your account details",
      icon: "person-outline",
      onPress: () =>
        navigation.navigate("MainTabs", { screen: "Profile" }),
    },
    {
      title: "Active sessions",
      subtitle: "Manage signed-in devices",
      icon: "phone-portrait-outline",
      onPress: () => navigation.navigate("Sessions"),
    },
    {
      title: "Notifications",
      subtitle: "View your latest updates",
      icon: "notifications-outline",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      title: loggingOut ? "Logging out…" : "Log out",
      subtitle: "Sign out of your account",
      icon: "log-out-outline",
      onPress: confirmLogout,
    },
    {
      title: "Delete account",
      subtitle: "Open the account deletion page",
      icon: "trash-outline",
      destructive: true,
      onPress: () => void openDeleteAccount(),
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: 22,
        paddingLeft: Math.max(insets.left, 18),
        paddingRight: Math.max(insets.right, 18),
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <View style={styles.inner}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.initial}>
              {user?.firstName?.trim()?.[0]?.toUpperCase() || "P"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.firstName || "Prepzo Learner"}</Text>
          <Text style={styles.caption}>Your account, your preferences</Text>
        </View>

        {rows.map((row) => (
          <Pressable
            key={row.icon}
            accessibilityRole="button"
            disabled={loggingOut}
            onPress={row.onPress}
            style={({ pressed }) => [
              styles.row,
              pressed && { opacity: 0.65 },
            ]}
          >
            <View
              style={[
                styles.icon,
                row.destructive && { backgroundColor: "#FFF0F0" },
              ]}
            >
              <Ionicons
                name={row.icon}
                size={22}
                color={row.destructive ? "#D14C4C" : "#2563EB"}
              />
            </View>
            <View style={styles.text}>
              <Text
                style={[
                  styles.rowTitle,
                  row.destructive && { color: "#D14C4C" },
                ]}
              >
                {row.title}
              </Text>
              <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9AA5B8" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F8FC" },
  inner: { width: "100%", maxWidth: 760, alignSelf: "center" },
  profile: { alignItems: "center", paddingVertical: 20, marginBottom: 20 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 25,
    backgroundColor: "#E6EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  initial: { fontSize: 30, fontWeight: "800", color: "#2563EB" },
  name: { fontSize: 22, fontWeight: "800", color: "#14213D", marginTop: 14 },
  caption: { fontSize: 13, color: "#758198", marginTop: 5 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 16,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF5",
  },
  icon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EDF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: "#14213D" },
  rowSubtitle: { fontSize: 12, lineHeight: 18, color: "#758198", marginTop: 4 },
});
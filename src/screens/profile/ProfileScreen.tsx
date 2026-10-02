import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "../../store/authStore";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type DetailProps = {
  icon: IconName;
  label: string;
  value: string;
};

type MenuRowProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function Detail({ icon, label, value }: DetailProps) {
  return (
    <View style={s.detail}>
      <View style={s.detailIcon}>
        <Ionicons name={icon} size={20} color="#6681AA" />
      </View>

      <View style={s.flex}>
        <Text style={s.label}>{label}</Text>
        <Text selectable style={s.value}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
}: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.menuRow,
        pressed && s.pressed,
      ]}
    >
      <View style={s.menuIcon}>
        <Ionicons name={icon} size={23} color="#5478AD" />
      </View>

      <View style={s.flex}>
        <Text style={s.menuTitle}>{title}</Text>
        <Text style={s.menuSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#A0ACBD"
      />
    </Pressable>
  );
}

function formatValue(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not added";
  }

  return String(value);
}

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loggingOut, setLoggingOut] = useState(false);

  const logoutBusy = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const name = user?.firstName?.trim() || "Learner";
  const initial = Array.from(name)[0]?.toUpperCase() || "P";

  const stacked = width < 360 || fontScale > 1.3;

  const performLogout = async () => {
    if (logoutBusy.current) return;

    logoutBusy.current = true;
    setLoggingOut(true);

    try {
      await logout();
    } catch {
      if (mounted.current) {
        Alert.alert(
          "Couldn't log out",
          "Please try again."
        );
      }
    } finally {
      logoutBusy.current = false;

      if (mounted.current) {
        setLoggingOut(false);
      }
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Log out of Prepzo?",
      "You can sign in again whenever you're ready.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => {
            void performLogout();
          },
        },
      ]
    );
  };

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingLeft: Math.max(insets.left, 20),
          paddingRight: Math.max(insets.right, 20),
          paddingBottom: Math.max(insets.bottom, 16) + 40,
        }}
      >
        <View style={s.page}>
          {/* Header */}
          <View style={s.topBar}>
            <View style={s.flex}>
              <Text
                accessibilityRole="header"
                style={s.pageTitle}
              >
                Your profile
              </Text>

              <Text style={s.pageSubtitle}>
                Your space. Your learning journey.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={() => navigation.navigate("Settings")}
              style={({ pressed }) => [
                s.settings,
                pressed && s.pressed,
              ]}
            >
              <Ionicons
                name="settings-outline"
                size={23}
                color="#49658E"
              />
            </Pressable>
          </View>

          {/* Profile identity */}
          <View style={s.identity}>
            <View style={s.accent} />

            <View
              style={[
                s.identityRow,
                stacked && s.identityStack,
              ]}
            >
              <View style={s.avatar} accessible={false}>
                <Text
                  style={s.initial}
                  maxFontSizeMultiplier={1.3}
                >
                  {initial}
                </Text>
              </View>

              <View style={s.flex}>
                <Text style={s.eyebrow}>
                  LEARNING WITH PREPZO
                </Text>

                <Text style={s.name}>{name}</Text>

                <Text style={s.identityCopy}>
                  A little better, every day.
                </Text>
              </View>
            </View>

            <View style={s.identityFooter}>
              <Ionicons
                name="book-outline"
                size={17}
                color="#6985AB"
              />

              <Text style={s.identityFooterText}>
                Make your next session count.
              </Text>
            </View>
          </View>

          {/* Account information */}
          <Text
            accessibilityRole="header"
            style={s.sectionTitle}
          >
            Account details
          </Text>

          <View style={s.details}>
            <Detail
              icon="person-outline"
              label="First name"
              value={name}
            />

            <View style={s.divider} />

            <Detail
              icon="mail-outline"
              label="Email address"
              value={formatValue(user?.email)}
            />

            <View style={s.divider} />

            <Detail
              icon="flag-outline"
              label="Goal ID"
              value={formatValue(user?.goalId)}
            />

            <View style={s.divider} />

            <Detail
              icon="school-outline"
              label="Class ID"
              value={formatValue(user?.classId)}
            />
          </View>

          {/* Account actions */}
          <Text
            accessibilityRole="header"
            style={s.sectionTitle}
          >
            Manage your account
          </Text>

          <MenuRow
            icon="phone-portrait-outline"
            title="Active sessions"
            subtitle="Review your signed-in devices"
            onPress={() => navigation.navigate("Sessions")}
          />

          <MenuRow
            icon="options-outline"
            title="Settings"
            subtitle="Manage your app preferences"
            onPress={() => navigation.navigate("Settings")}
          />

          <MenuRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Catch up on your latest updates"
            onPress={() =>
              navigation.navigate("Notifications")
            }
          />

          {/* Logout */}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: loggingOut,
              busy: loggingOut,
            }}
            disabled={loggingOut}
            onPress={confirmLogout}
            style={({ pressed }) => [
              s.logout,
              pressed && s.pressed,
            ]}
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color="#BF6565"
            />

            <Text style={s.logoutText}>
              {loggingOut ? "Logging out…" : "Log out"}
            </Text>
          </Pressable>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerTitle}>
              With <Text style={s.heart}>♥</Text> from Prepzo
            </Text>

            <Text style={s.footerCopy}>
              Created by the Soinech team
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFD",
  },

  page: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },

  flex: {
    flex: 1,
    minWidth: 0,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 25,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: "#24344F",
  },

  pageSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    color: "#8A96A8",
    marginTop: 5,
  },

  settings: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#EDF2FA",
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.65,
  },

  identity: {
    backgroundColor: "#EEF4FF",
    borderRadius: 25,
    padding: 22,
    overflow: "hidden",
  },

  accent: {
    position: "absolute",
    left: 0,
    top: 25,
    width: 4,
    height: 42,
    borderRadius: 3,
    backgroundColor: "#8DB2EF",
  },

  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
  },

  identityStack: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  initial: {
    fontSize: 29,
    fontWeight: "700",
    color: "#638BD0",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#839ABD",
    marginBottom: 7,
  },

  name: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#304F7B",
  },

  identityCopy: {
    fontSize: 12,
    lineHeight: 19,
    color: "#7B91AE",
    marginTop: 5,
  },

  identityFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#DDE7F7",
    marginTop: 22,
    paddingTop: 15,
  },

  identityFooterText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: "#6985AB",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: "#33445F",
    marginTop: 29,
    marginBottom: 14,
  },

  details: {
    paddingHorizontal: 17,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E9EEF5",
  },

  detail: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 18,
  },

  detailIcon: {
    width: 28,
    alignItems: "center",
    paddingTop: 3,
  },

  label: {
    fontSize: 11,
    lineHeight: 17,
    color: "#94A0B0",
    marginBottom: 5,
  },

  value: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    color: "#41536D",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E9EEF5",
    marginLeft: 40,
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5EAF2",
  },

  menuIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#EEF3FA",
    alignItems: "center",
    justifyContent: "center",
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#40516A",
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 18,
    color: "#8C98AA",
  },

  logout: {
    marginTop: 27,
    minHeight: 52,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#FBEFEF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },

  logoutText: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#BF6565",
  },

  footer: {
    alignItems: "center",
    paddingTop: 33,
    paddingBottom: 10,
  },

  footerTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8C99AD",
    textAlign: "center",
  },

  heart: {
    color: "#DA8C96",
  },

  footerCopy: {
    marginTop: 7,
    fontSize: 10,
    color: "#A9B2C0",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
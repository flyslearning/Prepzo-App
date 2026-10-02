import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User } from "../../types/auth";
import MenuItem from "./MenuItem";

type Props = {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onProfile: () => void;
  onSessions: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
};

export default function SideMenu({
  visible,
  user,
  onClose,
  onProfile,
  onSessions,
  onLogout,
  onDeleteAccount,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.menu,
            {
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          <View style={styles.topContent}>
            <View style={styles.headerRow}>
              <View style={styles.profileTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.firstName?.charAt(0)?.toUpperCase() || "P"}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user?.firstName || "Prepzo"} {user?.lastName || "Student"}
                  </Text>

                  <Text numberOfLines={1} style={styles.email}>
                    {user?.email}
                  </Text>
                </View>
              </View>

              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.line} />

            <MenuItem
              icon="👤"
              title="My Profile"
              subtitle="View and update your profile"
              onPress={onProfile}
            />

            <MenuItem
              icon="📱"
              title="Active Sessions"
              subtitle="Manage logged-in devices"
              onPress={onSessions}
            />

            <MenuItem
              icon="🎯"
              title="My Goal"
              subtitle="Goal and class details"
              onPress={onProfile}
            />

            <MenuItem
              icon="📊"
              title="Progress"
              subtitle="Coming soon"
              onPress={onClose}
            />

            <MenuItem
              icon="⚙️"
              title="Settings"
              subtitle="Coming soon"
              onPress={onClose}
            />
          </View>

          <View style={styles.bottomActions}>
            <MenuItem
              icon="🗑️"
              title="Delete Account"
              subtitle="Permanently delete your account"
              danger
              onPress={onDeleteAccount}
            />

            <MenuItem
              icon="⏻"
              title="Logout"
              subtitle="Logout from this device"
              danger
              onPress={onLogout}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.45)",
  },

  menu: {
    width: "82%",
    maxWidth: 360,
    height: "100%",
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    justifyContent: "space-between",
  },

  topContent: {
    flexShrink: 1,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  profileTop: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 2,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 26,
    fontFamily: "TitanOne",
    color: "#ffffff",
  },

  userInfo: {
    flex: 1,
    marginTop: -2,
  },

  userName: {
    fontSize: 17,
    fontFamily: "TitanOne",
    color: "#0f172a",
  },

  email: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: "Geologica",
    color: "#64748b",
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  closeText: {
    fontSize: 26,
    lineHeight: 28,
    color: "#0f172a",
    fontFamily: "Geologica",
  },

  line: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginTop: 16,
    marginBottom: 18,
  },

  bottomActions: {
    paddingBottom: 8,
  },
});
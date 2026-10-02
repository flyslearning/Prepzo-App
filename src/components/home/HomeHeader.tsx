import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  name?: string | null;
  onMenuPress: () => void;
};

export default function HomeHeader({ name, onMenuPress }: Props) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onMenuPress} style={styles.menuButton}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={styles.hello}>Hello,</Text>
        <Text numberOfLines={1} style={styles.name}>
          {name || "Student"}
        </Text>
      </View>

      <View style={styles.logoBox}>
        <Text style={styles.logoText}>P</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },

  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },

  menuIcon: {
    fontSize: 24,
    color: "#2563eb",
    fontWeight: "900",
  },

  hello: {
    fontSize: 13,
    fontFamily: "Geologica",
    color: "#64748b",
  },

  name: {
    fontSize: 23,
    fontFamily: "TitanOne",
    color: "#0f172a",
    marginTop: 2,
  },

  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 24,
    fontFamily: "TitanOne",
    color: "#ffffff",
  },
});
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress: () => void;
  danger?: boolean;
};

export default function MenuItem({
  title,
  subtitle,
  icon = "•",
  onPress,
  danger,
}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={[styles.iconBox, danger && styles.dangerBox]}>
        <Text style={[styles.icon, danger && styles.dangerText]}>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.title, danger && styles.dangerText]}>
          {title}
        </Text>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },

  dangerBox: {
    backgroundColor: "#fee2e2",
  },

  icon: {
    fontSize: 16,
    fontFamily: "Geologica",
    color: "#2563eb",
  },

  title: {
    fontSize: 15,
    fontFamily: "Geologica",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: "Geologica",
    color: "#64748b",
  },

  dangerText: {
    color: "#dc2626",
  },

  arrow: {
    fontSize: 26,
    color: "#94a3b8",
  },
});
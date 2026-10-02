import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useGeneratorStore } from "../../store/generatorStore";

export default function NotificationsScreen() {
  const { notifications, loadNotifications } = useGeneratorStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.type}>{item.type}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontFamily: "TitanOne", color: "#0f172a", marginBottom: 18 },
  card: { padding: 16, borderRadius: 18, backgroundColor: "#f8fafc", marginBottom: 12 },
  cardTitle: { fontSize: 17, fontFamily: "TitanOne", color: "#0f172a" },
  body: { marginTop: 8, fontFamily: "Geologica", color: "#64748b" },
  type: { marginTop: 8, fontFamily: "Geologica", color: "#2563eb" },
});
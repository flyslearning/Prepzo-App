import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useGeneratorStore } from "../../store/generatorStore";

export default function LeaderboardScreen() {
  const { leaderboard, loadLeaderboard } = useGeneratorStore();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => String(item.rank)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>#{item.rank}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.user}>User {item.user_id.slice(0, 6)}</Text>
              <Text style={styles.meta}>Tests: {item.total_tests} • Accuracy: {item.avg_accuracy}%</Text>
            </View>
            <Text style={styles.score}>{item.score}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontFamily: "TitanOne", color: "#0f172a", marginBottom: 18 },
  row: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#f8fafc", borderRadius: 18, marginBottom: 10, gap: 12 },
  rank: { fontFamily: "TitanOne", color: "#2563eb", fontSize: 22 },
  user: { fontFamily: "Geologica", color: "#0f172a" },
  meta: { marginTop: 4, fontFamily: "Geologica", color: "#64748b", fontSize: 12 },
  score: { fontFamily: "TitanOne", color: "#0f172a", fontSize: 20 },
});
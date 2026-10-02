import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useGeneratorStore } from "../../store/generatorStore";

export default function BookmarksScreen() {
  const { bookmarks, loadBookmarks } = useGeneratorStore();

  useEffect(() => {
    loadBookmarks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookmarks</Text>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.question}>{item.question_text}</Text>
            <Text style={styles.meta}>Answer: {item.correct_option}</Text>
            <Text style={styles.meta}>{item.explanation}</Text>
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
  question: { fontFamily: "Geologica", color: "#0f172a", lineHeight: 22 },
  meta: { marginTop: 8, fontFamily: "Geologica", color: "#64748b" },
});
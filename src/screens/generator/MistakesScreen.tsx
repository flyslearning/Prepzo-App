import React, { useEffect } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GeneratorApi } from "../../api/generatorApi";
import { useGeneratorStore } from "../../store/generatorStore";

export default function MistakesScreen() {
  const { mistakes, loadMistakes } = useGeneratorStore();

  useEffect(() => {
    loadMistakes();
  }, []);

  const improve = async (id: string) => {
    await GeneratorApi.improveMistake(id);
    await loadMistakes();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mistake Notebook</Text>

      <FlatList
        data={mistakes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.question}>{item.question_text}</Text>
            <Text style={styles.meta}>Correct: {item.correct_option}</Text>
            <Text style={styles.meta}>{item.explanation}</Text>

            <TouchableOpacity style={styles.btn} onPress={() => improve(item.id)}>
              <Text style={styles.btnText}>Mark Improved</Text>
            </TouchableOpacity>
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
  btn: { marginTop: 12, backgroundColor: "#2563eb", padding: 12, borderRadius: 14, alignItems: "center" },
  btnText: { color: "#fff", fontFamily: "Geologica" },
});
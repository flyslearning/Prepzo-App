import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import { GeneratorApi } from "../../api/generatorApi";
import { Question } from "../../types/generator";

export default function SharedTestScreen() {
  const [token, setToken] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSharedTest = async () => {
    if (!token.trim()) {
      Alert.alert("Required", "Enter share token");
      return;
    }

    try {
      setLoading(true);

      const res = await GeneratorApi.getSharedTest(token.trim());
      setQuestions(res.data.questions || []);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Shared test load failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shared Test</Text>

      <AppInput
        placeholder="Enter share token"
        value={token}
        onChangeText={setToken}
      />

      <AppButton title="Open Shared Test" onPress={loadSharedTest} loading={loading} />

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 18 }}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.qNo}>Q{index + 1}</Text>
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
  title: {
    marginTop: 30,
    fontSize: 28,
    fontFamily: "TitanOne",
    color: "#0f172a",
    marginBottom: 18,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    marginBottom: 12,
  },
  qNo: { fontFamily: "TitanOne", color: "#2563eb" },
  question: {
    marginTop: 6,
    fontFamily: "Geologica",
    color: "#0f172a",
    lineHeight: 22,
  },
  meta: { marginTop: 8, fontFamily: "Geologica", color: "#64748b" },
});
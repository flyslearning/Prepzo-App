import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import { GeneratorApi } from "../../api/generatorApi";
import { Question } from "../../types/generator";

export default function SearchQuestionsScreen() {
  const [keyword, setKeyword] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    try {
      setLoading(true);

      const res = await GeneratorApi.searchQuestions({
        keyword: keyword.trim(),
        source: "DB",
        page: 1,
        limit: 50,
      });

      setQuestions(res.data.questions || []);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const bookmark = async (questionId: string) => {
    try {
      await GeneratorApi.bookmarkQuestion(questionId);
      Alert.alert("Saved", "Question bookmarked");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Bookmark failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Questions</Text>

      <AppInput
        placeholder="Search keyword e.g. taxonomy"
        value={keyword}
        onChangeText={setKeyword}
      />

      <AppButton title="Search" onPress={search} loading={loading} />

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 18 }}
        ListEmptyComponent={<Text style={styles.empty}>No questions found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.question}>{item.question_text}</Text>
            <Text style={styles.meta}>A. {item.option_a}</Text>
            <Text style={styles.meta}>B. {item.option_b}</Text>
            <Text style={styles.meta}>C. {item.option_c}</Text>
            <Text style={styles.meta}>D. {item.option_d}</Text>

            <Text style={styles.answer}>Answer: {item.correct_option}</Text>

            <TouchableOpacity
              style={styles.bookmarkBtn}
              onPress={() => bookmark(item.id)}
            >
              <Text style={styles.bookmarkText}>Bookmark</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 28,
    fontFamily: "TitanOne",
    color: "#0f172a",
    marginBottom: 18,
  },
  empty: { fontFamily: "Geologica", color: "#64748b", marginTop: 20 },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    marginBottom: 12,
  },
  question: {
    fontFamily: "Geologica",
    color: "#0f172a",
    lineHeight: 22,
    marginBottom: 8,
  },
  meta: { marginTop: 5, fontFamily: "Geologica", color: "#475569" },
  answer: {
    marginTop: 8,
    fontFamily: "Geologica",
    color: "#2563eb",
  },
  bookmarkBtn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  bookmarkText: { color: "#fff", fontFamily: "Geologica" },
});
import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GeneratorApi } from "../../api/generatorApi";
import AppButton from "../../components/AppButton";
import { Question } from "../../types/generator";

export default function TestAttemptScreen({ route, navigation }: any) {
  const { testId, questions: previewQuestions, timeMinutes } = route.params || {};

  const [questions, setQuestions] = useState<Question[]>(previewQuestions || []);
  const [attemptId, setAttemptId] = useState("");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const current = questions[index];

  useEffect(() => {
    if (!previewQuestions) loadTest();
  }, []);

  const loadTest = async () => {
    const res = await GeneratorApi.getTestDetail(testId);
    setQuestions(res.data.questions || []);
  };

  const start = async () => {
    if (attemptId) return attemptId;

    const res = await GeneratorApi.startTest(testId);
    setAttemptId(res.data.attempt_id);
    return res.data.attempt_id;
  };

  const selectOption = async (option: string) => {
    if (!current) return;

    setAnswers((prev) => ({ ...prev, [current.id]: option }));

    try {
      const id = await start();
      await GeneratorApi.saveTestAnswer(id, {
        question_id: current.id,
        selected_option: option,
      });
    } catch {}
  };

  const submit = async () => {
    try {
      setLoading(true);
      const id = await start();

      await GeneratorApi.autosaveAttempt(id, {
        answers_json: answers,
        remaining_seconds: 0,
      });

      await GeneratorApi.submitTestAdvanced(id);

      navigation.replace("Result", { attemptId: id });
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  if (!current) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Questions</Text>
      </View>
    );
  }

  const options = [
    ["A", current.option_a],
    ["B", current.option_b],
    ["C", current.option_c],
    ["D", current.option_d],
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Question {index + 1}/{questions.length}</Text>

      <ScrollView>
        <Text style={styles.question}>{current.question_text}</Text>

        {options.map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => selectOption(key)}
            style={[
              styles.option,
              answers[current.id] === key && styles.selected,
            ]}
          >
            <Text style={[
              styles.optionText,
              answers[current.id] === key && styles.selectedText,
            ]}>
              {key}. {value}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <TouchableOpacity
          disabled={index === 0}
          style={styles.navBtn}
          onPress={() => setIndex(index - 1)}
        >
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>

        {index === questions.length - 1 ? (
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>{loading ? "Submitting..." : "Submit"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navBtn} onPress={() => setIndex(index + 1)}>
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontFamily: "TitanOne", color: "#0f172a", marginBottom: 18 },
  question: { fontSize: 17, fontFamily: "Geologica", color: "#0f172a", lineHeight: 25, marginBottom: 18 },
  option: { padding: 15, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", marginBottom: 10 },
  selected: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  optionText: { fontFamily: "Geologica", color: "#0f172a" },
  selectedText: { color: "#fff" },
  row: { flexDirection: "row", gap: 12, paddingTop: 12 },
  navBtn: { flex: 1, padding: 15, borderRadius: 16, backgroundColor: "#eef2ff", alignItems: "center" },
  navText: { fontFamily: "Geologica", color: "#2563eb" },
  submitBtn: { flex: 1, padding: 15, borderRadius: 16, backgroundColor: "#2563eb", alignItems: "center" },
  submitText: { fontFamily: "Geologica", color: "#fff" },
});
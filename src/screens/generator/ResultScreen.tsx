import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { GeneratorApi } from "../../api/generatorApi";
import AppButton from "../../components/AppButton";
import { AttemptResult } from "../../types/generator";

export default function ResultScreen({ route }: any) {
  const { attemptId } = route.params;
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await GeneratorApi.getAttemptResult(attemptId);
    setResult(res.data);
  };

  const generateAiReport = async () => {
    const res = await GeneratorApi.generateAiPerformanceReport(attemptId);
    setReport(res.data.report);
  };

  if (!result) return <ActivityIndicator style={{ flex: 1 }} color="#2563eb" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Result</Text>

      <View style={styles.scoreBox}>
        <Text style={styles.score}>{result.score}</Text>
        <Text style={styles.label}>Score</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.stat}>Correct: {result.correct_count}</Text>
        <Text style={styles.stat}>Wrong: {result.wrong_count}</Text>
      </View>

      <Text style={styles.stat}>Unattempted: {result.unattempted_count}</Text>

      <AppButton title="Generate AI Report" onPress={generateAiReport} />

      {report ? (
        <View style={styles.report}>
          <Text style={styles.reportTitle}>AI Report</Text>
          <Text style={styles.text}>{report.summary}</Text>
          <Text style={styles.text}>Weak: {report.weak_areas?.join(", ")}</Text>
          <Text style={styles.text}>Next: {report.next_steps?.join(", ")}</Text>
        </View>
      ) : null}

      {result.questions.map((q) => (
        <View key={q.question_id} style={styles.qCard}>
          <Text style={styles.text}>{q.question_text}</Text>
          <Text style={styles.text}>Your: {q.selected_option || "NA"}</Text>
          <Text style={styles.text}>Correct: {q.correct_option}</Text>
          <Text style={q.is_correct ? styles.correct : styles.wrong}>
            {q.is_correct ? "Correct" : "Wrong"}
          </Text>
          <Text style={styles.explanation}>{q.explanation}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 30, fontFamily: "TitanOne", color: "#0f172a" },
  scoreBox: { marginTop: 20, padding: 24, borderRadius: 24, backgroundColor: "#2563eb", alignItems: "center" },
  score: { fontSize: 46, fontFamily: "TitanOne", color: "#fff" },
  label: { fontFamily: "Geologica", color: "#dbeafe" },
  row: { flexDirection: "row", gap: 12, marginTop: 18 },
  stat: { fontFamily: "Geologica", color: "#0f172a", marginTop: 8 },
  report: { padding: 16, borderRadius: 18, backgroundColor: "#eef2ff", marginTop: 20 },
  reportTitle: { fontFamily: "TitanOne", fontSize: 20, color: "#0f172a" },
  qCard: { padding: 16, borderRadius: 18, backgroundColor: "#f8fafc", marginTop: 14 },
  text: { fontFamily: "Geologica", color: "#0f172a", marginTop: 6 },
  correct: { fontFamily: "Geologica", color: "#16a34a", marginTop: 6 },
  wrong: { fontFamily: "Geologica", color: "#dc2626", marginTop: 6 },
  explanation: { fontFamily: "Geologica", color: "#64748b", marginTop: 8, lineHeight: 20 },
});
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GeneratorApi } from "../../api/generatorApi";
import AppButton from "../../components/AppButton";
import { Question } from "../../types/generator";

export default function DppAttemptScreen({ route, navigation }: any) {
  const { dppId, questions = [] } = route.params || {};

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const current: Question | undefined = questions[index];

  const submitAnswer = async (option: string) => {
    if (!current || answered[current.id]) return;

    try {
      setLoading(true);

      const res = await GeneratorApi.submitDppAnswer(dppId, {
        question_id: current.id,
        selected_option: option,
      });

      setAnswered((prev) => ({
        ...prev,
        [current.id]: res.data,
      }));
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Answer submit failed");
    } finally {
      setLoading(false);
    }
  };

  const saveDpp = async () => {
    try {
      await GeneratorApi.saveDpp(dppId);
      Alert.alert("Saved", "DPP saved successfully");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "DPP save failed");
    }
  };

  if (!current) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Questions</Text>
      </View>
    );
  }

  const result = answered[current.id];

  const options = [
    ["A", current.option_a],
    ["B", current.option_b],
    ["C", current.option_c],
    ["D", current.option_d],
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        DPP Question {index + 1}/{questions.length}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{current.question_text}</Text>

        {options.map(([key, value]) => {
          const isSelected = result?.selected_option === key;
          const isCorrect = result?.correct_option === key;

          return (
            <TouchableOpacity
              key={key}
              disabled={!!result || loading}
              onPress={() => submitAnswer(key)}
              style={[
                styles.option,
                isSelected && styles.selected,
                result && isCorrect && styles.correct,
                result && isSelected && !result.is_correct && styles.wrong,
              ]}
            >
              <Text style={styles.optionText}>
                {key}. {value}
              </Text>
            </TouchableOpacity>
          );
        })}

        {result ? (
          <View style={styles.resultBox}>
            <Text
              style={[
                styles.resultTitle,
                result.is_correct ? styles.correctText : styles.wrongText,
              ]}
            >
              {result.is_correct ? "Correct Answer" : "Wrong Answer"}
            </Text>

            <Text style={styles.explanation}>
              Correct Option: {result.correct_option}
            </Text>

            <Text style={styles.explanation}>{result.explanation}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          disabled={index === 0}
          style={styles.navBtn}
          onPress={() => setIndex(index - 1)}
        >
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>

        {index === questions.length - 1 ? (
          <TouchableOpacity style={styles.saveBtn} onPress={saveDpp}>
            <Text style={styles.saveText}>Save DPP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setIndex(index + 1)}
          >
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 23,
    fontFamily: "TitanOne",
    color: "#0f172a",
    marginBottom: 18,
  },
  question: {
    fontSize: 17,
    fontFamily: "Geologica",
    color: "#0f172a",
    lineHeight: 25,
    marginBottom: 18,
  },
  option: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    marginBottom: 10,
  },
  selected: { borderColor: "#2563eb" },
  correct: { backgroundColor: "#dcfce7", borderColor: "#16a34a" },
  wrong: { backgroundColor: "#fee2e2", borderColor: "#dc2626" },
  optionText: { fontFamily: "Geologica", color: "#0f172a" },
  resultBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
  },
  resultTitle: { fontSize: 18, fontFamily: "TitanOne" },
  correctText: { color: "#16a34a" },
  wrongText: { color: "#dc2626" },
  explanation: {
    marginTop: 8,
    fontFamily: "Geologica",
    color: "#475569",
    lineHeight: 21,
  },
  bottom: { flexDirection: "row", gap: 12, paddingTop: 12 },
  navBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    alignItems: "center",
  },
  navText: { fontFamily: "Geologica", color: "#2563eb" },
  saveBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  saveText: { fontFamily: "Geologica", color: "#fff" },
});
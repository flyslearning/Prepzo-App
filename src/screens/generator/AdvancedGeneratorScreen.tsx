import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import { GeneratorApi } from "../../api/generatorApi";

export default function AdvancedGeneratorScreen({ navigation }: any) {
  const [questions, setQuestions] = useState("20");
  const [minutes, setMinutes] = useState("30");
  const [loadingWeak, setLoadingWeak] = useState(false);
  const [loadingAdaptive, setLoadingAdaptive] = useState(false);

  const generateWeakTest = async () => {
    try {
      setLoadingWeak(true);

      const res = await GeneratorApi.generateWeakChapterTest({
        total_questions: Number(questions),
        time_minutes: Number(minutes),
        per_question_marks: 4,
        negative_marks: 1,
      });

      navigation.navigate("TestAttempt", {
        testId: res.data.test_id,
        questions: res.data.questions,
        timeMinutes: Number(minutes),
      });
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Weak test failed");
    } finally {
      setLoadingWeak(false);
    }
  };

  const generateAdaptiveDpp = async () => {
    try {
      setLoadingAdaptive(true);

      const res = await GeneratorApi.generateAdaptiveDpp({
        total_questions: Number(questions),
        time_minutes: 0,
      });

      navigation.navigate("DppAttempt", {
        dppId: res.data.dpp_id,
        questions: res.data.questions,
      });
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Adaptive DPP failed");
    } finally {
      setLoadingAdaptive(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Generator</Text>
      <Text style={styles.subtitle}>
        Generate practice from weak chapters and adaptive DPP.
      </Text>

      <AppInput
        placeholder="Total Questions"
        value={questions}
        onChangeText={setQuestions}
        keyboardType="number-pad"
      />

      <View style={{ height: 12 }} />

      <AppInput
        placeholder="Time Minutes"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="number-pad"
      />

      <AppButton
        title="Generate Weak Chapter Test"
        onPress={generateWeakTest}
        loading={loadingWeak}
      />

      <AppButton
        title="Generate Adaptive DPP"
        onPress={generateAdaptiveDpp}
        loading={loadingAdaptive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    marginTop: 30,
    fontSize: 30,
    fontFamily: "TitanOne",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    fontFamily: "Geologica",
    color: "#64748b",
    lineHeight: 21,
  },
});
import React, { useMemo, useRef, useState } from "react";

import {
  Alert,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export type SwipeQuestion = {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number; // 0 = A, 1 = B, 2 = C...
  explanation: string;
};

type Answer = {
  selected: number | null;
  checked: boolean;
  skipped: boolean;
};

const EMPTY: Answer = {
  selected: null,
  checked: false,
  skipped: false,
};

const BLUE = "#2563EB";

const DEMO: SwipeQuestion[] = [
  {
    id: "demo-1",
    subject: "Biology",
    question:
      "Which organelle is the main site of aerobic ATP production in a eukaryotic cell?",
    options: [
      "Ribosome",
      "Mitochondrion",
      "Golgi apparatus",
      "Lysosome",
    ],
    correctIndex: 1,
    explanation:
      "Mitochondria produce most ATP during aerobic respiration through oxidative phosphorylation across the inner mitochondrial membrane.",
  },
  {
    id: "demo-2",
    subject: "Physics",
    question:
      "A body starts from rest and accelerates uniformly at 2 m/s² for 5 seconds. What is its final speed?",
    options: ["5 m/s", "10 m/s", "20 m/s", "25 m/s"],
    correctIndex: 1,
    explanation:
      "Using v = u + at: v = 0 + (2 × 5) = 10 m/s.",
  },
  {
    id: "demo-3",
    subject: "Chemistry",
    question: "What is the atomic number of carbon?",
    options: ["6", "8", "12", "14"],
    correctIndex: 0,
    explanation:
      "The atomic number equals the number of protons. Carbon has 6 protons.",
  },
  {
    id: "demo-4",
    subject: "Biology",
    question:
      "During which phase of the cell cycle does DNA replication occur?",
    options: ["G₁ phase", "S phase", "G₂ phase", "M phase"],
    correctIndex: 1,
    explanation:
      "DNA replication occurs during the synthesis (S) phase of interphase.",
  },
  {
    id: "demo-5",
    subject: "Physics",
    question: "What is the SI unit of electric resistance?",
    options: ["Ampere", "Volt", "Ohm", "Watt"],
    correctIndex: 2,
    explanation:
      "Resistance is measured in ohms (Ω). From R = V/I, one ohm equals one volt per ampere.",
  },
];

function isQuestion(value: unknown): value is SwipeQuestion {
  if (!value || typeof value !== "object") return false;

  const q = value as Partial<SwipeQuestion>;

  return (
    typeof q.id === "string" &&
    q.id.trim().length > 0 &&
    typeof q.subject === "string" &&
    typeof q.question === "string" &&
    q.question.trim().length > 0 &&
    Array.isArray(q.options) &&
    q.options.length >= 2 &&
    q.options.every(
      (option) =>
        typeof option === "string" &&
        option.trim().length > 0
    ) &&
    typeof q.correctIndex === "number" &&
    Number.isInteger(q.correctIndex) &&
    q.correctIndex >= 0 &&
    q.correctIndex < q.options.length &&
    typeof q.explanation === "string"
  );
}

export default function SwipeScreen({
  navigation,
  route,
}: any) {
  const raw = route?.params?.questions;
  const demo = raw === undefined;

  const questions = useMemo(() => {
    if (demo) return DEMO;

    if (!Array.isArray(raw) || !raw.every(isQuestion)) {
      return [];
    }

    if (new Set(raw.map((q) => q.id)).size !== raw.length) {
      return [];
    }

    return raw as SwipeQuestion[];
  }, [raw, demo]);

  // A changed question set starts a fresh session.
  return (
    <PracticeSession
      key={JSON.stringify(questions)}
      questions={questions}
      navigation={navigation}
      demo={demo}
    />
  );
}

function PracticeSession({
  questions,
  navigation,
  demo,
}: {
  questions: SwipeQuestion[];
  navigation: any;
  demo: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();

  const scroll = useRef<ScrollView>(null);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, Answer>
  >({});
  const [analysis, setAnalysis] = useState(false);

  const q = questions[index];
  const answer = q ? answers[q.id] ?? EMPTY : EMPTY;
  const total = questions.length;

  const attempted = questions.filter(
    (item) => answers[item.id]?.checked
  ).length;

  const correct = questions.filter(
    (item) =>
      answers[item.id]?.checked &&
      answers[item.id]?.selected === item.correctIndex
  ).length;

  const skipped = questions.filter(
    (item) =>
      answers[item.id]?.skipped &&
      !answers[item.id]?.checked
  ).length;

  const pending = total - attempted - skipped;

  const accuracy = attempted
    ? Math.round((correct / attempted) * 100)
    : 0;

  const back = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const jump = (nextIndex: number) => {
    setIndex(nextIndex);

    scroll.current?.scrollTo({
      y: 0,
      animated: false,
    });
  };

  const next = () => {
    if (!q) return;

    if (!answer.checked) {
      setAnswers((prev) => ({
        ...prev,
        [q.id]: {
          ...(prev[q.id] ?? EMPTY),
          skipped: true,
        },
      }));
    }

    if (index < total - 1) {
      jump(index + 1);
    } else {
      setAnalysis(true);
    }
  };

  const previous = () => {
    if (index > 0) jump(index - 1);
  };

  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > 24 &&
      Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.8,

    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) < 70) return;

      if (gesture.dx < 0) {
        next();
      } else {
        previous();
      }
    },
  });

  const select = (option: number) => {
    if (!q || answer.checked) return;

    setAnswers((prev) => ({
      ...prev,
      [q.id]: {
        selected: option,
        checked: false,
        skipped: false,
      },
    }));
  };

  const check = () => {
    if (
      !q ||
      answer.selected === null ||
      answer.checked
    ) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        checked: true,
        skipped: false,
      },
    }));
  };

  const restart = () => {
    Alert.alert(
      "Restart practice?",
      "This will clear the answers for this session.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restart",
          style: "destructive",
          onPress: () => {
            setAnswers({});
            jump(0);
            setAnalysis(false);
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        s.screen,
        { paddingTop: insets.top + 10 },
      ]}
    >
      <View
        style={[
          s.page,
          {
            paddingLeft: Math.max(insets.left, 18),
            paddingRight: Math.max(insets.right, 18),
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            s.header,
            fontScale > 1.5 && s.wrap,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={back}
            style={s.iconButton}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#344761"
            />
          </Pressable>

          <View style={s.flex}>
            <Text style={s.title}>Swipe practice</Text>

            <Text style={s.subtitle}>
              {demo
                ? "Demo • Try a quick session"
                : "One question. One step forward."}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setAnalysis(true)}
            style={s.analysisButton}
          >
            <Ionicons
              name="stats-chart-outline"
              size={17}
              color={BLUE}
            />

            <Text style={s.analysisLabel}>Analysis</Text>
          </Pressable>
        </View>

        {!q ? (
          <View style={s.empty}>
            <Ionicons
              name="documents-outline"
              size={45}
              color="#829AC1"
            />

            <Text style={s.question}>
              No questions available
            </Text>

            <Text style={s.body}>
              Pass a valid question list to start practising.
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom:
                Math.max(insets.bottom, 16) + 55,
            }}
          >
            {/* Progress */}
            <View style={s.progressLabels}>
              <Text style={s.small}>
                Question {index + 1} of {total}
              </Text>

              <Text style={s.small}>
                {attempted} answered
              </Text>
            </View>

            <View style={s.track}>
              <View
                style={[
                  s.fill,
                  {
                    width: `${(attempted / total) * 100}%`,
                  },
                ]}
              />
            </View>

            {/* Swipeable question */}
            <View style={s.card} {...pan.panHandlers}>
              <View style={s.cardTop}>
                <Text style={s.subject}>
                  {q.subject || "Practice"}
                </Text>

                <Text style={s.small}>
                  Single correct answer
                </Text>
              </View>

              <Text style={s.question}>{q.question}</Text>

              <Text style={s.instruction}>
                Select one option, then check your answer.
              </Text>

              {q.options.map((option, i) => {
                const selected = answer.selected === i;

                const right =
                  answer.checked && i === q.correctIndex;

                const wrong =
                  answer.checked && selected && !right;

                return (
                  <Pressable
                    key={i}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: selected,
                      disabled: answer.checked,
                    }}
                    accessibilityLabel={`${String.fromCharCode(
                      65 + i
                    )}. ${option}${
                      right
                        ? ". Correct answer"
                        : wrong
                        ? ". Incorrect answer"
                        : ""
                    }`}
                    disabled={answer.checked}
                    onPress={() => select(i)}
                    style={[
                      s.option,
                      selected && s.selected,
                      right && s.right,
                      wrong && s.wrong,
                    ]}
                  >
                    <View
                      style={[
                        s.letter,
                        selected && s.letterSelected,
                      ]}
                    >
                      <Text
                        style={[
                          s.letterText,
                          selected && { color: BLUE },
                        ]}
                      >
                        {String.fromCharCode(65 + i)}
                      </Text>
                    </View>

                    <Text style={s.optionText}>
                      {option}
                    </Text>

                    <Ionicons
                      name={
                        right
                          ? "checkmark-circle"
                          : wrong
                          ? "close-circle"
                          : selected
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={21}
                      color={
                        right
                          ? "#299264"
                          : wrong
                          ? "#D26767"
                          : selected
                          ? BLUE
                          : "#CCD5E2"
                      }
                    />
                  </Pressable>
                );
              })}

              {/* Answer explanation */}
              {answer.checked && (
                <View
                  style={s.explanation}
                  accessibilityLiveRegion="polite"
                >
                  <Text
                    style={[
                      s.resultTitle,
                      {
                        color:
                          answer.selected === q.correctIndex
                            ? "#238258"
                            : "#BA6262",
                      },
                    ]}
                  >
                    {answer.selected === q.correctIndex
                      ? "Correct answer!"
                      : "Let's learn from this one."}
                  </Text>

                  <Text style={s.body}>
                    Correct answer:{" "}
                    {q.options[q.correctIndex]}
                  </Text>

                  {!!q.explanation && (
                    <Text style={s.body}>
                      {q.explanation}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Controls */}
            <View
              style={[
                s.actions,
                fontScale > 1.4 && s.column,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                disabled={index === 0}
                onPress={previous}
                style={[
                  s.secondary,
                  index === 0 && s.disabled,
                ]}
              >
                <Text style={s.secondaryText}>
                  Previous
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={
                  !answer.checked &&
                  answer.selected === null
                }
                onPress={answer.checked ? next : check}
                style={[
                  s.primary,
                  !answer.checked &&
                    answer.selected === null &&
                    s.disabled,
                ]}
              >
                <Text style={s.primaryText}>
                  {answer.checked
                    ? index === total - 1
                      ? "View analysis"
                      : "Next question"
                    : "Check answer"}
                </Text>
              </Pressable>
            </View>

            {!answer.checked && (
              <Pressable
                accessibilityRole="button"
                onPress={next}
                style={s.skip}
              >
                <Text style={s.skipText}>
                  Skip for now
                </Text>

                <Ionicons
                  name="play-skip-forward-outline"
                  size={16}
                  color="#8394AA"
                />
              </Pressable>
            )}

            <Text style={s.hint}>
              Swipe left for next • Swipe right for previous.
              {"\n"}
              Unchecked answers are marked skipped when you
              move next.
            </Text>
          </ScrollView>
        )}
      </View>

      {/* Analysis */}
      <Modal
        visible={analysis}
        animationType="fade"
        onRequestClose={() => setAnalysis(false)}
      >
        <View
          style={[
            s.screen,
            { paddingTop: insets.top + 14 },
          ]}
        >
          <ScrollView
            contentContainerStyle={[
              s.modalContent,
              {
                paddingBottom: insets.bottom + 30,
                paddingLeft: Math.max(insets.left, 22),
                paddingRight: Math.max(insets.right, 22),
              },
            ]}
          >
            <View style={s.header}>
              <View style={s.flex}>
                <Text style={s.title}>Your analysis</Text>

                <Text style={s.subtitle}>
                  This practice session
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close analysis"
                onPress={() => setAnalysis(false)}
                style={s.iconButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#344761"
                />
              </Pressable>
            </View>

            <View style={s.score}>
              <Text style={s.scoreNumber}>
                {attempted ? `${accuracy}%` : "—"}
              </Text>

              <Text style={s.scoreLabel}>
                Accuracy on checked answers
              </Text>

              <Text style={s.body}>
                {correct} correct out of {attempted} answered
              </Text>
            </View>

            <View style={s.stats}>
              {[
                ["Correct", correct, "#238258"],
                ["Incorrect", attempted - correct, "#C56969"],
                ["Skipped", skipped, "#B68C3F"],
                ["Pending", pending, "#7385A1"],
              ].map(([label, count, color]) => (
                <View
                  key={String(label)}
                  style={[
                    s.stat,
                    fontScale > 1.4 && { width: "100%" },
                  ]}
                >
                  <Text
                    style={[
                      s.statNumber,
                      { color: String(color) },
                    ]}
                  >
                    {count}
                  </Text>

                  <Text style={s.small}>{label}</Text>
                </View>
              ))}
            </View>

            <Text style={s.sectionTitle}>
              Review questions
            </Text>

            <Text style={s.body}>
              Tap a number to return to that question.
            </Text>

            <View style={s.palette}>
              {questions.map((item, i) => {
                const a = answers[item.id];

                const state = a?.checked
                  ? a.selected === item.correctIndex
                    ? "Correct"
                    : "Incorrect"
                  : a?.skipped
                  ? "Skipped"
                  : "Pending";

                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Question ${
                      i + 1
                    }, ${state}`}
                    onPress={() => {
                      jump(i);
                      setAnalysis(false);
                    }}
                    style={[
                      s.number,
                      state === "Correct" && s.right,
                      state === "Incorrect" && s.wrong,
                      state === "Skipped" && s.skipped,
                    ]}
                  >
                    <Text style={s.numberText}>
                      {i + 1}
                    </Text>

                    <Text style={s.numberState}>
                      {state}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              style={s.primary}
              onPress={() => setAnalysis(false)}
            >
              <Text style={s.primaryText}>
                Continue practice
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={s.skip}
              onPress={restart}
            >
              <Text style={s.skipText}>
                Restart session
              </Text>
            </Pressable>

            <Text style={s.hint}>
              Progress is kept only while this screen remains
              mounted.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFD",
  },

  page: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },

  flex: {
    flex: 1,
    minWidth: 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },

  wrap: {
    flexWrap: "wrap",
  },

  iconButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#273B58",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 10,
    lineHeight: 17,
    color: "#8593A7",
    marginTop: 4,
  },

  analysisButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 12,
    backgroundColor: "#EAF1FF",
    borderRadius: 13,
  },

  analysisLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: BLUE,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },

  small: {
    fontSize: 11,
    lineHeight: 18,
    color: "#8593A7",
  },

  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E8EDF5",
    marginTop: 9,
    marginBottom: 22,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    backgroundColor: "#81A5E9",
    borderRadius: 3,
  },

  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7EDF6",
    backgroundColor: "#FFFFFF",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
  },

  subject: {
    fontSize: 11,
    fontWeight: "600",
    color: "#597EB8",
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },

  question: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "700",
    color: "#2E405C",
    marginTop: 24,
  },

  instruction: {
    fontSize: 11,
    lineHeight: 18,
    color: "#98A2B2",
    marginTop: 12,
    marginBottom: 20,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 13,
    minHeight: 62,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EDF4",
    marginBottom: 11,
  },

  selected: {
    backgroundColor: "#F0F5FF",
    borderColor: "#88AEEF",
  },

  right: {
    backgroundColor: "#EEF9F2",
    borderColor: "#9BD2B3",
  },

  wrong: {
    backgroundColor: "#FFF2F2",
    borderColor: "#E8AEAE",
  },

  skipped: {
    backgroundColor: "#FFF8E9",
    borderColor: "#E7D29E",
  },

  letter: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F1F4F9",
    alignItems: "center",
    justifyContent: "center",
  },

  letterSelected: {
    backgroundColor: "#E0EBFF",
  },

  letterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8A99B0",
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#42536E",
  },

  explanation: {
    marginTop: 12,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#F7F9FC",
  },

  resultTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },

  body: {
    fontSize: 12,
    lineHeight: 21,
    color: "#7E8CA1",
    marginTop: 6,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },

  column: {
    flexDirection: "column",
  },

  primary: {
    flexGrow: 1,
    minHeight: 52,
    padding: 15,
    borderRadius: 16,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  secondary: {
    minHeight: 52,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#EAF0F9",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: "#6580A7",
    fontSize: 13,
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.4,
  },

  skip: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: 12,
    marginTop: 8,
  },

  skipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8394AA",
  },

  hint: {
    textAlign: "center",
    color: "#96A2B4",
    fontSize: 10,
    lineHeight: 18,
    marginTop: 12,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 60,
  },

  modalContent: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },

  score: {
    padding: 25,
    backgroundColor: "#EDF3FF",
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 20,
  },

  scoreNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: "#527FC7",
  },

  scoreLabel: {
    fontSize: 12,
    color: "#6684B1",
    marginTop: 8,
    textAlign: "center",
  },

  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  stat: {
    width: "48%",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },

  statNumber: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#344B6B",
    marginTop: 16,
  },

  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 20,
  },

  number: {
    minWidth: 76,
    minHeight: 62,
    padding: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DCE4F0",
    backgroundColor: "#F1F4FA",
  },

  numberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#49617F",
  },

  numberState: {
    fontSize: 9,
    color: "#74869D",
    marginTop: 4,
  },
});
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { GeneratorApi } from "../../api/generatorApi";
import { Subject, Chapter, Topic, Subtopic } from "../../types/generator";

type DppMode = "db" | "ai" | "both";

export default function CreateDppScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chaptersBySubject, setChaptersBySubject] = useState<
    Record<string, Chapter[]>
  >({});
  const [topicsByChapter, setTopicsByChapter] = useState<
    Record<string, Topic[]>
  >({});
  const [subtopicsByTopic, setSubtopicsByTopic] = useState<
    Record<string, Subtopic[]>
  >({});

  const [expandedSubjectId, setExpandedSubjectId] = useState("");
  const [expandedChapterId, setExpandedChapterId] = useState("");
  const [expandedTopicId, setExpandedTopicId] = useState("");

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<string[]>([]);

  const [mode, setMode] = useState<DppMode>("db");
  const [aiPercentage, setAiPercentage] = useState("50");
  const [totalQuestions, setTotalQuestions] = useState("10");
  const [timeMinutes, setTimeMinutes] = useState("0");

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState("");
  const [loadingTopics, setLoadingTopics] = useState("");
  const [loadingSubtopics, setLoadingSubtopics] = useState("");
  const [generating, setGenerating] = useState(false);
  const [adaptiveLoading, setAdaptiveLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const selectedCount = useMemo(() => {
    return (
      selectedSubjectIds.length +
      selectedChapterIds.length +
      selectedTopicIds.length +
      selectedSubtopicIds.length
    );
  }, [
    selectedSubjectIds,
    selectedChapterIds,
    selectedTopicIds,
    selectedSubtopicIds,
  ]);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const res = await GeneratorApi.getSubjects();
      setSubjects(res.data.subjects || []);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Subjects load failed");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const toggleArray = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const openSubject = async (subjectId: string) => {
    const isOpen = expandedSubjectId === subjectId;

    setExpandedSubjectId(isOpen ? "" : subjectId);
    setExpandedChapterId("");
    setExpandedTopicId("");

    toggleArray(subjectId, setSelectedSubjectIds);

    if (!isOpen && !chaptersBySubject[subjectId]) {
      try {
        setLoadingChapters(subjectId);

        const res = await GeneratorApi.getChapters(subjectId);

        setChaptersBySubject((prev) => ({
          ...prev,
          [subjectId]: res.data.chapters || [],
        }));
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.error || "Chapters load failed");
      } finally {
        setLoadingChapters("");
      }
    }
  };

  const openChapter = async (chapterId: string) => {
    const isOpen = expandedChapterId === chapterId;

    setExpandedChapterId(isOpen ? "" : chapterId);
    setExpandedTopicId("");

    toggleArray(chapterId, setSelectedChapterIds);

    if (!isOpen && !topicsByChapter[chapterId]) {
      try {
        setLoadingTopics(chapterId);

        const res = await GeneratorApi.getTopics(chapterId);

        setTopicsByChapter((prev) => ({
          ...prev,
          [chapterId]: res.data.topics || [],
        }));
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.error || "Topics load failed");
      } finally {
        setLoadingTopics("");
      }
    }
  };

  const openTopic = async (topicId: string) => {
    const isOpen = expandedTopicId === topicId;

    setExpandedTopicId(isOpen ? "" : topicId);

    toggleArray(topicId, setSelectedTopicIds);

    if (!isOpen && !subtopicsByTopic[topicId]) {
      try {
        setLoadingSubtopics(topicId);

        const res = await GeneratorApi.getSubtopics(topicId);

        setSubtopicsByTopic((prev) => ({
          ...prev,
          [topicId]: res.data.subtopics || [],
        }));
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.error || "Subtopics load failed");
      } finally {
        setLoadingSubtopics("");
      }
    }
  };

  const getPercentages = () => {
    if (mode === "db") {
      return {
        ai_percentage: 0,
        db_percentage: 100,
      };
    }

    if (mode === "ai") {
      return {
        ai_percentage: 100,
        db_percentage: 0,
      };
    }

    const ai = Number(aiPercentage);

    if (!ai || ai < 1 || ai > 99) {
      throw new Error("AI percentage must be between 1 and 99.");
    }

    return {
      ai_percentage: ai,
      db_percentage: 100 - ai,
    };
  };

  const generateDpp = async () => {
    Keyboard.dismiss();

    if (generating) return;

    if (selectedSubjectIds.length === 0) {
      Alert.alert("Required", "Please select at least one subject.");
      return;
    }

    const total = Number(totalQuestions);
    const minutes = Number(timeMinutes);

    if (!total || total < 1) {
      Alert.alert("Invalid", "Enter valid total questions.");
      return;
    }

    if (minutes < 0) {
      Alert.alert("Invalid", "Time minutes cannot be negative.");
      return;
    }

    let percentages;

    try {
      percentages = getPercentages();
    } catch (error: any) {
      Alert.alert("Invalid", error.message);
      return;
    }

    const payload = {
      mode,
      ai_percentage: percentages.ai_percentage,
      db_percentage: percentages.db_percentage,
      subject_ids: selectedSubjectIds,
      chapter_ids: selectedChapterIds,
      topic_ids: selectedTopicIds,
      subtopic_ids: selectedSubtopicIds,
      total_questions: total,
      time_minutes: minutes,
    };

    console.log("DPP PREVIEW PAYLOAD:", JSON.stringify(payload, null, 2));

    try {
      setGenerating(true);

      const res = await GeneratorApi.generateDppPreview(payload);

      navigation.navigate("DppAttempt", {
        dppId: res.data.dpp_id,
        questions: res.data.questions || [],
      });
    } catch (e: any) {
      console.log("DPP PREVIEW ERROR:", e?.response?.data || e?.message);

      Alert.alert(
        "Generate Failed",
        e?.response?.data?.error || "DPP generate failed"
      );
    } finally {
      setGenerating(false);
    }
  };

  const generateAdaptiveDpp = async () => {
    Keyboard.dismiss();

    const total = Number(totalQuestions);
    const minutes = Number(timeMinutes);

    if (!total || total < 1) {
      Alert.alert("Invalid", "Enter valid total questions.");
      return;
    }

    try {
      setAdaptiveLoading(true);

      const res = await GeneratorApi.generateAdaptiveDpp({
        total_questions: total,
        time_minutes: minutes || 0,
      });

      navigation.navigate("DppAttempt", {
        dppId: res.data.dpp_id,
        questions: res.data.questions || [],
      });
    } catch (e: any) {
      Alert.alert(
        "Adaptive Failed",
        e?.response?.data?.error || "Adaptive DPP failed"
      );
    } finally {
      setAdaptiveLoading(false);
    }
  };

  const disabled =
    generating ||
    selectedSubjectIds.length === 0 ||
    !totalQuestions.trim();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 170 },
          ]}
        >
          <Text style={styles.title}>Create DPP</Text>

          <Text style={styles.subtitle}>
            Generate daily practice problems from subject, chapter, topic or
            subtopic.
          </Text>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Selected Items</Text>
            <Text style={styles.summaryText}>
              {selectedCount === 0
                ? "Nothing selected yet"
                : `${selectedCount} items selected`}
            </Text>
          </View>

          <Text style={styles.label}>DPP Mode</Text>

          <View style={styles.modeRow}>
            {(["db", "ai", "both"] as DppMode[]).map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                onPress={() => setMode(item)}
                style={[
                  styles.modeChip,
                  mode === item && styles.modeChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === item && styles.modeTextActive,
                  ]}
                >
                  {item === "db" ? "DB" : item === "ai" ? "AI" : "Both"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === "both" ? (
            <>
              <View style={{ height: 12 }} />

              <AppInput
                placeholder="AI Percentage e.g. 50"
                value={aiPercentage}
                onChangeText={setAiPercentage}
                keyboardType="number-pad"
              />
            </>
          ) : null}

          <Text style={styles.label}>Subjects</Text>

          {loadingSubjects ? (
            <ActivityIndicator color="#2563eb" />
          ) : subjects.length === 0 ? (
            <Text style={styles.empty}>No subjects found.</Text>
          ) : (
            subjects.map((subject) => {
              const selected = selectedSubjectIds.includes(subject.id);
              const expanded = expandedSubjectId === subject.id;
              const chapters = chaptersBySubject[subject.id] || [];

              return (
                <View key={subject.id} style={styles.block}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => openSubject(subject.id)}
                    style={[styles.item, selected && styles.selected]}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selected && styles.selectedText,
                      ]}
                    >
                      {expanded ? "▼" : "▶"} {subject.name}
                    </Text>
                  </TouchableOpacity>

                  {expanded ? (
                    <View style={styles.childBox}>
                      {loadingChapters === subject.id ? (
                        <ActivityIndicator color="#2563eb" />
                      ) : chapters.length === 0 ? (
                        <Text style={styles.empty}>No chapters found.</Text>
                      ) : (
                        chapters.map((chapter) => {
                          const chapterSelected = selectedChapterIds.includes(
                            chapter.id
                          );
                          const chapterExpanded =
                            expandedChapterId === chapter.id;
                          const topics = topicsByChapter[chapter.id] || [];

                          return (
                            <View key={chapter.id}>
                              <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => openChapter(chapter.id)}
                                style={[
                                  styles.childItem,
                                  chapterSelected && styles.selected,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.childText,
                                    chapterSelected &&
                                      styles.selectedText,
                                  ]}
                                >
                                  {chapterExpanded ? "▼" : "▶"} {chapter.name}
                                </Text>
                              </TouchableOpacity>

                              {chapterExpanded ? (
                                <View style={styles.topicBox}>
                                  {loadingTopics === chapter.id ? (
                                    <ActivityIndicator color="#2563eb" />
                                  ) : topics.length === 0 ? (
                                    <Text style={styles.empty}>
                                      No topics found.
                                    </Text>
                                  ) : (
                                    topics.map((topic) => {
                                      const topicSelected =
                                        selectedTopicIds.includes(topic.id);
                                      const topicExpanded =
                                        expandedTopicId === topic.id;
                                      const subtopics =
                                        subtopicsByTopic[topic.id] || [];

                                      return (
                                        <View key={topic.id}>
                                          <TouchableOpacity
                                            activeOpacity={0.85}
                                            onPress={() =>
                                              openTopic(topic.id)
                                            }
                                            style={[
                                              styles.topicItem,
                                              topicSelected &&
                                                styles.selected,
                                            ]}
                                          >
                                            <Text
                                              style={[
                                                styles.topicText,
                                                topicSelected &&
                                                  styles.selectedText,
                                              ]}
                                            >
                                              {topicExpanded ? "▼" : "▶"}{" "}
                                              {topic.name}
                                            </Text>
                                          </TouchableOpacity>

                                          {topicExpanded ? (
                                            <View style={styles.subtopicBox}>
                                              {loadingSubtopics === topic.id ? (
                                                <ActivityIndicator color="#2563eb" />
                                              ) : subtopics.length === 0 ? (
                                                <Text style={styles.empty}>
                                                  No subtopics found.
                                                </Text>
                                              ) : (
                                                subtopics.map((subtopic) => {
                                                  const subSelected =
                                                    selectedSubtopicIds.includes(
                                                      subtopic.id
                                                    );

                                                  return (
                                                    <TouchableOpacity
                                                      key={subtopic.id}
                                                      activeOpacity={0.85}
                                                      onPress={() =>
                                                        toggleArray(
                                                          subtopic.id,
                                                          setSelectedSubtopicIds
                                                        )
                                                      }
                                                      style={[
                                                        styles.subtopicItem,
                                                        subSelected &&
                                                          styles.selected,
                                                      ]}
                                                    >
                                                      <Text
                                                        style={[
                                                          styles.subtopicText,
                                                          subSelected &&
                                                            styles.selectedText,
                                                        ]}
                                                      >
                                                        • {subtopic.name}
                                                      </Text>
                                                    </TouchableOpacity>
                                                  );
                                                })
                                              )}
                                            </View>
                                          ) : null}
                                        </View>
                                      );
                                    })
                                  )}
                                </View>
                              ) : null}
                            </View>
                          );
                        })
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}

          <Text style={styles.label}>DPP Settings</Text>

          <AppInput
            placeholder="Total Questions"
            value={totalQuestions}
            onChangeText={setTotalQuestions}
            keyboardType="number-pad"
          />

          <View style={{ height: 12 }} />

          <AppInput
            placeholder="Time Minutes"
            value={timeMinutes}
            onChangeText={setTimeMinutes}
            keyboardType="number-pad"
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Mode: {mode === "db" ? "DB" : mode === "ai" ? "AI" : "AI + DB"}
            </Text>
            <Text style={styles.infoText}>Payload uses subject_ids array</Text>
            <Text style={styles.infoText}>
              DPP is best for short daily practice
            </Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom + 12 },
          ]}
        >
          <AppButton
            title={
              generating
                ? "Generating..."
                : mode === "ai"
                ? "Generate AI DPP"
                : mode === "both"
                ? "Generate Mixed DPP"
                : "Generate DB DPP"
            }
            onPress={generateDpp}
            loading={generating}
            disabled={disabled}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={generateAdaptiveDpp}
            disabled={adaptiveLoading}
            style={styles.adaptiveBtn}
          >
            <Text style={styles.adaptiveText}>
              {adaptiveLoading ? "Generating Adaptive..." : "Generate Adaptive DPP"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingTop: 20,
  },

  title: {
    fontSize: 30,
    fontFamily: "TitanOne",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: "Geologica",
    color: "#64748b",
    lineHeight: 20,
  },

  summaryBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },

  summaryTitle: {
    fontSize: 13,
    fontFamily: "Geologica",
    color: "#2563eb",
  },

  summaryText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Geologica",
    color: "#64748b",
  },

  label: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 15,
    fontFamily: "Geologica",
    color: "#0f172a",
  },

  modeRow: {
    flexDirection: "row",
    gap: 10,
  },

  modeChip: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },

  modeChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  modeText: {
    fontFamily: "Geologica",
    color: "#0f172a",
    fontSize: 13,
  },

  modeTextActive: {
    color: "#ffffff",
  },

  empty: {
    fontSize: 13,
    fontFamily: "Geologica",
    color: "#94a3b8",
    marginVertical: 8,
  },

  block: {
    marginBottom: 8,
  },

  item: {
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  childBox: {
    marginLeft: 10,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#dbeafe",
    paddingLeft: 10,
  },

  childItem: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  topicBox: {
    marginLeft: 10,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#e0e7ff",
    paddingLeft: 10,
  },

  topicItem: {
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  subtopicBox: {
    marginLeft: 10,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#f1f5f9",
    paddingLeft: 10,
  },

  subtopicItem: {
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  selected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  itemText: {
    fontFamily: "Geologica",
    color: "#0f172a",
    fontSize: 14,
  },

  childText: {
    fontFamily: "Geologica",
    color: "#0f172a",
    fontSize: 13,
  },

  topicText: {
    fontFamily: "Geologica",
    color: "#0f172a",
    fontSize: 13,
  },

  subtopicText: {
    fontFamily: "Geologica",
    color: "#0f172a",
    fontSize: 12,
  },

  selectedText: {
    color: "#ffffff",
  },

  infoBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  infoText: {
    fontFamily: "Geologica",
    color: "#64748b",
    fontSize: 13,
    marginBottom: 4,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  adaptiveBtn: {
    marginTop: 10,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },

  adaptiveText: {
    fontFamily: "Geologica",
    color: "#2563eb",
    fontSize: 13,
  },
});
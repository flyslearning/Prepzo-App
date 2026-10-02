import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { Goal, GoalClass } from "../../types/auth";
import { MastersApi } from "../../api/mastersApi";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../utils/error";
import CustomAlert from "../../components/CustomAlert";

export default function CompleteProfileScreen() {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("male");

  const [goals, setGoals] = useState<Goal[]>([]);
  const [classes, setClasses] = useState<GoalClass[]>([]);

  const [goalId, setGoalId] = useState("");
  const [classId, setClassId] = useState("");

  const [selectedGoalName, setSelectedGoalName] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");

  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [saving, setSaving] = useState(false);

  const [classModal, setClassModal] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const completeProfile = useAuthStore((s) => s.completeProfile);

  useEffect(() => {
    loadGoals();
  }, []);

  const uniqueGoals = useMemo(() => {
    const map = new Map<string, Goal>();
    goals.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [goals]);

  const uniqueClasses = useMemo(() => {
    const map = new Map<string, GoalClass>();
    classes.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [classes]);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const loadGoals = async () => {
    try {
      setLoadingGoals(true);

      const res = await MastersApi.getGoals();

      setGoals(res.data.data.goals || []);
    } catch (error) {
      showAlert("Error", getErrorMessage(error));
    } finally {
      setLoadingGoals(false);
    }
  };

  const loadClasses = async (goal: Goal) => {
    try {
      setGoalId(goal.id);
      setSelectedGoalName(goal.name);
      setClassId("");
      setSelectedClassName("");
      setClasses([]);

      setLoadingClasses(true);

      const res = await MastersApi.getClassesByGoal(goal.id);

      setClasses(res.data.data.classes || goal.classes || []);
      setClassModal(true);
    } catch {
      setClasses(goal.classes || []);
      setClassModal(true);
    } finally {
      setLoadingClasses(false);
    }
  };

  const clearGoal = () => {
    setGoalId("");
    setSelectedGoalName("");
    setClassId("");
    setSelectedClassName("");
    setClasses([]);
  };

  const clearClass = () => {
    setClassId("");
    setSelectedClassName("");
  };

  const handleNext = () => {
    Keyboard.dismiss();

    if (!firstName.trim() || !lastName.trim()) {
      showAlert("Incomplete Details", "Please enter your first and last name.");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!goalId || !classId) {
      showAlert("Selection Required", "Please select your goal and class.");
      return;
    }

    try {
      setSaving(true);

      await completeProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        goalId,
        classId,
      });
    } catch (error) {
      showAlert("Profile Failed", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.topCircle} />
          <View style={styles.bottomCircle} />

          <View style={[styles.top, { marginTop: insets.top + 14 }]}>
            <LottieView
              source={require("../../assets/animations/profile.json")}
              autoPlay
              loop
              style={styles.lottie}
            />

            <Text style={styles.title}>
              {step === 1 ? "Your Basic Details" : "Select Goal & Class"}
            </Text>

            <Text style={styles.subtitle}>
              {step === 1
                ? "Tell us about yourself to personalize Prepzo."
                : "Choose your preparation goal and current class."}
            </Text>

            <View style={styles.stepBox}>
              <View style={[styles.stepDot, step >= 1 && styles.activeDot]}>
                <Text style={styles.stepText}>1</Text>
              </View>

              <View style={styles.stepLine} />

              <View style={[styles.stepDot, step >= 2 && styles.activeDot]}>
                <Text style={styles.stepText}>2</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            {step === 1 && (
              <>
                <AppInput
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                />

                <View style={{ height: 12 }} />

                <AppInput
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                />

                <Text style={styles.label}>Select Gender</Text>

                <View style={styles.genderRow}>
                  {["male", "female", "other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      activeOpacity={0.8}
                      style={[
                        styles.genderChip,
                        gender === g && styles.activeChip,
                      ]}
                      onPress={() => setGender(g)}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          gender === g && styles.activeText,
                        ]}
                      >
                        {g.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {step === 2 && (
              <>
                {selectedGoalName ? (
                  <View style={styles.selectedBox}>
                    <View style={styles.selectedHeader}>
                      <View>
                        <Text style={styles.selectedLabel}>Selected Goal</Text>
                        <Text style={styles.selectedValue}>
                          {selectedGoalName}
                        </Text>
                      </View>

                      <TouchableOpacity onPress={clearGoal} style={styles.crossBtn}>
                        <Text style={styles.crossText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                {selectedClassName ? (
                  <View style={styles.selectedBox}>
                    <View style={styles.selectedHeader}>
                      <View>
                        <Text style={styles.selectedLabel}>Selected Class</Text>
                        <Text style={styles.selectedValue}>
                          {selectedClassName}
                        </Text>
                      </View>

                      <TouchableOpacity onPress={clearClass} style={styles.crossBtn}>
                        <Text style={styles.crossText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                <Text style={styles.label}>Select Goal</Text>

                {loadingGoals ? (
                  <ActivityIndicator color="#2563eb" style={{ marginTop: 20 }} />
                ) : (
                  <FlatList
                    data={uniqueGoals}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.goalListContent}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={[
                          styles.item,
                          goalId === item.id && styles.selectedItem,
                        ]}
                        onPress={() => loadClasses(item)}
                      >
                        <Text
                          style={[
                            styles.itemText,
                            goalId === item.id && styles.selectedItemText,
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </>
            )}
          </View>

          <View style={[styles.bottom, { paddingBottom: insets.bottom + 10 }]}>
            {step === 2 ? (
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.backText}>Back to details</Text>
              </TouchableOpacity>
            ) : null}

            <AppButton
              title={step === 1 ? "Next" : "Complete Profile"}
              onPress={step === 1 ? handleNext : handleSubmit}
              loading={saving}
              disabled={saving}
            />
          </View>

          <Modal visible={classModal} transparent animationType="slide">
            <View style={styles.modalBg}>
              <View
                style={[
                  styles.modalCard,
                  { paddingBottom: insets.bottom + 32 },
                ]}
              >
                <View style={styles.modalHandle} />

                <Text style={styles.modalTitle}>Select Class</Text>

                {loadingClasses ? (
                  <ActivityIndicator color="#2563eb" style={{ marginTop: 20 }} />
                ) : (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.classListContent}
                  >
                    {uniqueClasses.map((cls) => (
                      <TouchableOpacity
                        key={cls.id}
                        activeOpacity={0.85}
                        style={[
                          styles.modalItem,
                          classId === cls.id && styles.modalSelectedItem,
                        ]}
                        onPress={() => {
                          setClassId(cls.id);
                          setSelectedClassName(cls.name);
                          setClassModal(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.modalItemText,
                            classId === cls.id && styles.modalSelectedText,
                          ]}
                        >
                          {cls.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setClassModal(false)}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText="Got it"
        onClose={() => setAlertVisible(false)}
        onConfirm={() => setAlertVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },

  topCircle: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#e0e7ff",
  },

  bottomCircle: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#eef2ff",
  },

  top: {
    alignItems: "center",
  },

  lottie: {
    width: 200,
    height: 140,
  },

  title: {
    textAlign: "center",
    fontSize: 25,
    fontFamily: "TitanOne",
    color: "#0f172a",
    letterSpacing: 0.3,
  },

  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Geologica",
    color: "#64748b",
    lineHeight: 19,
  },

  stepBox: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },

  activeDot: {
    backgroundColor: "#2563eb",
  },

  stepText: {
    color: "#ffffff",
    fontFamily: "Geologica",
    fontSize: 13,
  },

  stepLine: {
    width: 54,
    height: 2,
    backgroundColor: "#cbd5e1",
  },

  content: {
    flex: 1,
    marginTop: 24,
  },

  label: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: "Geologica",
    color: "#0f172a",
  },

  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  genderChip: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  activeChip: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  genderText: {
    fontSize: 12,
    fontFamily: "Geologica",
    color: "#0f172a",
  },

  activeText: {
    color: "#ffffff",
  },

  goalListContent: {
    paddingBottom: 140,
  },

  item: {
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  selectedItem: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  itemText: {
    fontFamily: "Geologica",
    color: "#0f172a",
    fontSize: 14,
  },

  selectedItemText: {
    color: "#ffffff",
  },

  selectedBox: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
    marginBottom: 10,
  },

  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  selectedLabel: {
    fontSize: 12,
    color: "#6366f1",
    fontFamily: "Geologica",
    marginBottom: 4,
  },

  selectedValue: {
    color: "#1e3a8a",
    fontFamily: "Geologica",
    fontSize: 15,
  },

  crossBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },

  crossText: {
    fontSize: 22,
    lineHeight: 24,
    color: "#1e3a8a",
  },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },

  backText: {
    textAlign: "center",
    fontFamily: "Geologica",
    color: "#2563eb",
    marginBottom: 4,
  },

  modalBg: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.38)",
  },

  modalCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    maxHeight: "72%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },

  modalHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: "TitanOne",
    color: "#0f172a",
    marginBottom: 14,
  },

  classListContent: {
    paddingBottom: 10,
  },

  modalItem: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  modalSelectedItem: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  modalItemText: {
    fontFamily: "Geologica",
    color: "#0f172a",
  },

  modalSelectedText: {
    color: "#ffffff",
  },

  closeModalBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },

  closeModalText: {
    fontFamily: "Geologica",
    color: "#0f172a",
  },
});
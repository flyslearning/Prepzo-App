import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import { GeneratorApi } from "../../api/generatorApi";

export default function RevisionFolderScreen() {
  const [name, setName] = useState("");
  const [folderId, setFolderId] = useState("");
  const [questionId, setQuestionId] = useState("");
  const [loading, setLoading] = useState(false);

  const createFolder = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Enter folder name");
      return;
    }

    try {
      setLoading(true);

      const res = await GeneratorApi.createRevisionFolder(name.trim());
      setFolderId(res.data.folder_id);
      Alert.alert("Created", "Revision folder created");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Folder create failed");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    if (!folderId || !questionId.trim()) {
      Alert.alert("Required", "Enter folder id and question id");
      return;
    }

    try {
      setLoading(true);

      await GeneratorApi.addQuestionToRevisionFolder(
        folderId,
        questionId.trim()
      );

      Alert.alert("Added", "Question added to revision folder");
      setQuestionId("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Question add failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revision Folder</Text>

      <Text style={styles.label}>Create Folder</Text>

      <AppInput
        placeholder="Organic Chemistry Weak Questions"
        value={name}
        onChangeText={setName}
      />

      <AppButton
        title="Create Folder"
        onPress={createFolder}
        loading={loading}
      />

      {folderId ? (
        <View style={styles.folderBox}>
          <Text style={styles.folderText}>Folder ID: {folderId}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Add Question</Text>

      <AppInput
        placeholder="Question ID"
        value={questionId}
        onChangeText={setQuestionId}
      />

      <AppButton title="Add Question" onPress={addQuestion} loading={loading} />
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
  },
  label: {
    marginTop: 24,
    marginBottom: 10,
    fontFamily: "Geologica",
    color: "#0f172a",
  },
  folderBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
  },
  folderText: { fontFamily: "Geologica", color: "#2563eb" },
});
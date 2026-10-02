import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { GeneratorApi } from "../../api/generatorApi";

export default function JoinBatchScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!code.trim()) {
      Alert.alert("Required", "Enter batch code");
      return;
    }

    try {
      setLoading(true);
      await GeneratorApi.joinBatch(code.trim().toUpperCase());
      Alert.alert("Success", "Batch joined successfully");
      setCode("");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || "Join batch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Batch</Text>
      <Text style={styles.subtitle}>Enter your institute batch code.</Text>

      <AppInput placeholder="Batch Code" value={code} onChangeText={setCode} autoCapitalize="characters" />

      <AppButton title="Join Batch" onPress={join} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { marginTop: 40, fontSize: 30, fontFamily: "TitanOne", color: "#0f172a" },
  subtitle: { marginTop: 8, marginBottom: 20, fontFamily: "Geologica", color: "#64748b" },
});
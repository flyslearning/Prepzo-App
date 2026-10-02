import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Screen from "../../components/Screen";
import Loader from "../../components/Loader";
import { AuthApi } from "../../api/authApi";
import { Session } from "../../types/auth";
import { getErrorMessage } from "../../utils/error";
import { COLORS } from "../../constants/colors";

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);

      const res = await AuthApi.getSessions();

      setSessions(res.data.data.sessions);
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Screen>
      <Text style={styles.title}>Active Sessions</Text>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No active sessions found.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.device}>Device ID</Text>
            <Text style={styles.value}>{item.deviceId}</Text>

            <Text style={styles.label}>IP Address</Text>
            <Text style={styles.value}>{item.ipAddress}</Text>

            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>{item.createdAt}</Text>

            <Text style={styles.label}>Expires</Text>
            <Text style={styles.value}>{item.expiresAt}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 16,
  },
  empty: {
    color: COLORS.muted,
    marginTop: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  device: {
    fontWeight: "800",
    color: COLORS.text,
  },
  label: {
    marginTop: 10,
    fontWeight: "700",
    color: COLORS.text,
  },
  value: {
    color: COLORS.muted,
    marginTop: 4,
  },
});
import React from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
} from "react-native";

export default function AppInput(props: TextInputProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholderTextColor="#94a3b8"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  input: {
    height: 56,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 15,
    fontFamily: "Geologica",
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#e2e8f0",

    shadowColor: "#1e293b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});
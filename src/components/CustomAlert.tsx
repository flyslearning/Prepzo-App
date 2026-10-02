import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

type Props = {
  visible: boolean;
  type?: "info" | "success" | "error" | "exit";
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function CustomAlert({
  visible,
  type = "info",
  title,
  message,
  confirmText = "Got it",
  cancelText = "Cancel",
  onClose,
  onConfirm,
}: Props) {
  const isExit = type === "exit";
  const isError = type === "error";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View
            style={[
              styles.iconBox,
              isExit || isError ? styles.errorIcon : styles.infoIcon,
            ]}
          >
            <Text style={styles.iconText}>
              {isExit || isError ? "!" : "i"}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          {isExit ? (
            <View style={styles.row}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </Pressable>

              <Pressable style={styles.exitButton} onPress={onConfirm}>
                <Text style={styles.buttonText}>{confirmText}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.button} onPress={onConfirm}>
              <Text style={styles.buttonText}>{confirmText}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  box: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },

  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  infoIcon: {
    backgroundColor: "#dbeafe",
  },

  errorIcon: {
    backgroundColor: "#fee2e2",
  },

  iconText: {
    fontSize: 24,
    fontFamily: "TitanOne",
    color: "#2563eb",
  },

  title: {
    fontSize: 22,
    fontFamily: "TitanOne",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: 1,
  },

  message: {
    fontSize: 14,
    fontFamily: "Geologica",
    color: "#64748b",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },

  button: {
    width: "100%",
    height: 50,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
    width: "100%",
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  exitButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Geologica",
  },

  cancelText: {
    color: "#0f172a",
    fontSize: 15,
    fontFamily: "Geologica",
  },
});
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  TextInput,
  ScrollView,
  BackHandler,
} from "react-native";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "../../components/AppButton";
import CustomAlert from "../../components/CustomAlert";
import { useAuthStore } from "../../store/authStore";

const getSendOtpErrorMessage = (error: any) => {
  const backendError = error?.response?.data?.message || error?.message || "";

  if (backendError === "Please wait before requesting another OTP") {
    return "Please wait before requesting another OTP.";
  }

  if (backendError === "Too many OTP requests. Try again after 10 minutes") {
    return "Too many OTP requests. Try again after 10 minutes.";
  }

  if (error?.message === "Network Error") {
    return "No internet connection. Please check your network and try again.";
  }

  if (error?.message === "Request timeout") {
    return "OTP request timeout ho gaya. Internet slow hai, please retry karo.";
  }

  return backendError || "Unable to send OTP right now. Please try again.";
};

const getVerifyOtpErrorMessage = (error: any) => {
  const backendError = error?.response?.data?.message || error?.message || "";

  if (backendError === "Invalid or expired OTP") {
    return "Incorrect or expired OTP. Please try again.";
  }

  if (backendError === "Too many wrong OTP attempts. Try again after 10 minutes") {
    return "Too many wrong attempts. Please try again after 10 minutes.";
  }

  if (error?.message === "Network Error") {
    return "No internet connection. Please check your network and try again.";
  }

  if (error?.message === "Request timeout") {
    return "Verification timeout ho gaya. Internet slow hai, please retry karo.";
  }

  return backendError || "Verification failed. Please try again.";
};

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), ms)
    ),
  ]);
};

export default function OtpScreen({ route, navigation }: any) {
  const email = route?.params?.email || "";

  const insets = useSafeAreaInsets();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<"info" | "exit">("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [pendingExit, setPendingExit] = useState(false);

  const verifyOtpApi = useAuthStore((s) => s.verifyOtp);
  const sendOtpApi = useAuthStore((s) => s.sendOtp);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const backAction = () => {
      showExitAlert();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (pendingExit) return;

      e.preventDefault();
      showExitAlert();
    });

    return unsubscribe;
  }, [navigation, pendingExit]);

  const showAlert = (title: string, message: string) => {
    setAlertType("info");
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const showExitAlert = () => {
    setAlertType("exit");
    setAlertTitle("Exit Verification");
    setAlertMessage("Are you sure you want to exit OTP verification?");
    setAlertVisible(true);
  };

  const handleChange = (text: string, index: number) => {
    if (!/^[0-9]?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (otp[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    Keyboard.dismiss();

    if (loading) return;

    const finalOtp = otp.join("");

    if (finalOtp.length < 6) {
      showAlert("Invalid OTP", "Enter complete 6 digit OTP.");
      return;
    }

    try {
      setLoading(true);

      await withTimeout(verifyOtpApi(email, finalOtp), 20000);
    } catch (error: any) {
      showAlert("Verification Failed", getVerifyOtpErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    Keyboard.dismiss();

    if (timer > 0 || resending) return;

    try {
      setResending(true);

      await withTimeout(sendOtpApi(email), 20000);

      setOtp(["", "", "", "", "", ""]);
      setTimer(30);
      inputs.current[0]?.focus();

      showAlert("OTP Sent", "OTP sent successfully.");
    } catch (error: any) {
      showAlert("OTP Failed", getSendOtpErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);

    if (alertType === "exit") {
      setPendingExit(true);
      navigation.goBack();
    }
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
    setPendingExit(false);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.topCircle} />
          <View style={styles.bottomCircle} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inner}>
                <View style={{ height: insets.top + 42 }} />

                <View style={styles.topSection}>
                  <LottieView
                    source={require("../../assets/animations/otp.json")}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />

                  <Text style={styles.title}>Verify OTP</Text>

                  <Text style={styles.subtitle}>Code sent to</Text>

                  <Text numberOfLines={1} style={styles.email}>
                    {email}
                  </Text>
                </View>

                <View style={styles.middleSection}>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          inputs.current[index] = ref;
                        }}
                        style={[
                          styles.otpBox,
                          digit ? styles.otpFilled : null,
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        textAlign="center"
                        selectionColor="#2563eb"
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === "Backspace") {
                            handleBackspace(index);
                          }
                        }}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.spacer} />

                <View
                  style={[
                    styles.bottomSection,
                    {
                      marginBottom: insets.bottom + 20,
                    },
                  ]}
                >
                  <AppButton
                    title="Verify & Continue"
                    onPress={verifyOtp}
                    loading={loading}
                    disabled={otp.join("").length < 6 || loading}
                  />

                  <TouchableOpacity
                    activeOpacity={timer > 0 ? 1 : 0.7}
                    onPress={resendOtp}
                    disabled={timer > 0 || resending}
                  >
                    <Text
                      style={[
                        styles.resend,
                        timer > 0 ? styles.resendDisabled : null,
                      ]}
                    >
                      {timer > 0
                        ? `Resend OTP in ${timer}s`
                        : resending
                        ? "Sending..."
                        : "Resend OTP"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.footer}>
                    Secure login • Fast verification
                  </Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        confirmText={alertType === "exit" ? "Exit" : "Got it"}
        cancelText="Stay"
        onClose={handleAlertClose}
        onConfirm={handleAlertConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollContent: {
    flexGrow: 1,
  },

  inner: {
    flex: 1,
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

  topSection: {
    alignItems: "center",
  },

  lottie: {
    width: 215,
    height: 165,
  },

  title: {
    fontSize: 36,
    fontFamily: "Bungee",
    color: "#0f172a",
    marginTop: -6,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: "Geologica",
    color: "#6b7280",
    marginTop: 8,
  },

  email: {
    fontSize: 14,
    color: "#2563eb",
    fontFamily: "Geologica",
    maxWidth: "88%",
    marginTop: 3,
  },

  middleSection: {
    marginTop: 34,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
  },

  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Geologica",
    color: "#111827",
    backgroundColor: "#f8fafc",
  },

  otpFilled: {
    borderColor: "#2563eb",
    backgroundColor: "#eef2ff",
  },

  spacer: {
    flex: 1,
  },

  bottomSection: {
    paddingHorizontal: 24,
    gap: 12,
  },

  resend: {
    textAlign: "center",
    fontFamily: "Geologica",
    color: "#2563eb",
    paddingVertical: 5,
  },

  resendDisabled: {
    color: "#94a3b8",
  },

  footer: {
    textAlign: "center",
    fontFamily: "Geologica",
    fontSize: 12,
    color: "#9ca3af",
  },
});
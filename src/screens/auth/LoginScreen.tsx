import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import CustomAlert from "../../components/CustomAlert";
import { useAuthStore } from "../../store/authStore";

const getOtpErrorMessage = (error: any) => {
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

  if (error?.message === "OTP request timeout") {
    return "OTP request timeout ho gaya. Internet slow hai, please retry karo.";
  }

  return backendError || "Something went wrong. Please try again.";
};

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("OTP request timeout")), ms)
    ),
  ]);
};

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const insets = useSafeAreaInsets();
  const sendOtpApi = useAuthStore((s) => s.sendOtp);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const sendOtp = async () => {
    Keyboard.dismiss();

    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      showAlert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await withTimeout(sendOtpApi(cleanEmail), 20000);

      navigation.navigate("Otp", {
        email: cleanEmail,
      });
    } catch (error: any) {
      showAlert("OTP Failed", getOtpErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={["#eff6ff", "#ffffff", "#eef2ff"]}
          style={styles.container}
        >
          <View style={styles.topCircle} />
          <View style={styles.midCircle} />
          <View style={styles.bottomCircle} />
          <View style={styles.glowCircle} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
          >
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingTop: insets.top + 18,
                  paddingBottom: insets.bottom + 22,
                },
              ]}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={[
                  styles.inner,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim },
                    ],
                  },
                ]}
              >
                <View style={styles.topSection}>
                  <Animated.View
                    style={[
                      styles.lottieWrap,
                      {
                        transform: [{ translateY: floatY }],
                      },
                    ]}
                  >
                    <LottieView
                      source={require("../../assets/animations/email.json")}
                      autoPlay
                      loop
                      style={styles.lottie}
                    />
                  </Animated.View>

                  <Text style={styles.brand}>Prepzo</Text>

                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      Smart Learning • Daily Practice • Better Scores
                    </Text>
                  </View>
                </View>

                <View style={styles.bottomSection}>
                  <Text style={styles.formTitle}>Continue With Email</Text>

                  <Text style={styles.formSubtitle}>
                    Enter your email to receive a secure OTP.
                  </Text>

                  <AppInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <AppButton
                    title="Continue"
                    onPress={sendOtp}
                    loading={loading}
                    disabled={!email.trim() || loading}
                  />

                  <View style={styles.footerBox}>
                    <Text style={styles.footer}>
                      Secure login • No password required
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
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
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },

  topCircle: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(37,99,235,0.13)",
  },

  midCircle: {
    position: "absolute",
    top: 210,
    left: -55,
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: "rgba(99,102,241,0.12)",
  },

  bottomCircle: {
    position: "absolute",
    bottom: -105,
    left: -90,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(14,165,233,0.14)",
  },

  glowCircle: {
    position: "absolute",
    bottom: 170,
    right: -50,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(37,99,235,0.08)",
  },

  topSection: {
    alignItems: "center",
    marginTop: 4,
  },

  lottieWrap: {
    width: 310,
    height: 205,
    alignItems: "center",
    justifyContent: "center",
  },

  lottie: {
    width: 320,
    height: 210,
  },

  brand: {
    fontSize: 45,
    fontFamily: "TitanOne",
    color: "#2563eb",
    letterSpacing: 2,
    marginTop: 0,
    textTransform: "uppercase",
  },

  pill: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },

  pillText: {
    fontSize: 12,
    fontFamily: "Geologica",
    color: "#475569",
    textAlign: "center",
  },

  bottomSection: {
    marginTop: 28,
  },

  formTitle: {
    fontSize: 25,
    fontFamily: "TitanOne",
    color: "#0f172a",
    letterSpacing: 0.4,
    marginBottom: 8,
  },

  formSubtitle: {
    fontSize: 13,
    fontFamily: "Geologica",
    color: "#64748b",
    lineHeight: 19,
    marginBottom: 16,
  },

  footerBox: {
    marginTop: 14,
    paddingVertical: 10,
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Geologica",
    color: "#94a3b8",
  },
});
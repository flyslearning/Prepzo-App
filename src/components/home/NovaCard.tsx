import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AccessibilityInfo,
  Animated,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

const AI_ANIMATION = require("../../assets/animations/ai.json");

type Props = {
  onPress: () => void;
};

export default function NovaCard({ onPress }: Props) {
  const focused = useIsFocused();
  const { fontScale } = useWindowDimensions();

  const animationRef = useRef<LottieView>(null);
  const scale = useRef(new Animated.Value(1)).current;

  const [cardWidth, setCardWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [animationFailed, setAnimationFailed] = useState(false);

  const [foreground, setForeground] = useState(
    AppState.currentState === "active"
  );

  const stacked =
    fontScale > 1.35 ||
    (cardWidth > 0 && cardWidth < 310);

  const animationSize = stacked ? 92 : 108;

  const shouldAnimate =
    focused &&
    foreground &&
    !reduceMotion &&
    !animationFailed;

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});

    const motionSubscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );

    const appSubscription = AppState.addEventListener(
      "change",
      (state) => setForeground(state === "active")
    );

    return () => {
      mounted = false;
      motionSubscription.remove();
      appSubscription.remove();
    };
  }, []);

  const syncPlayback = useCallback(() => {
    if (shouldAnimate) {
      animationRef.current?.play();
    } else {
      animationRef.current?.pause();
    }
  }, [shouldAnimate]);

  useEffect(() => {
    syncPlayback();

    const animation = animationRef.current;

    return () => {
      animation?.pause();
    };
  }, [syncPlayback]);

  useEffect(() => {
    if (reduceMotion || !focused || !foreground) {
      scale.stopAnimation();
      scale.setValue(1);
    }

    return () => scale.stopAnimation();
  }, [reduceMotion, focused, foreground, scale]);

  const animatePress = (value: number) => {
    if (reduceMotion) return;

    scale.stopAnimation();

    Animated.spring(scale, {
      toValue: value,
      stiffness: 330,
      damping: 25,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;

        setCardWidth((previous) =>
          Math.abs(previous - nextWidth) > 0.5
            ? nextWidth
            : previous
        );
      }}
      style={[
        styles.container,
        { transform: [{ scale }] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Meet Nova, your AI study companion"
        accessibilityHint="Opens the Nova screen"
        onPress={onPress}
        onPressIn={() => animatePress(0.985)}
        onPressOut={() => animatePress(1)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <View
          style={[
            styles.hero,
            stacked && styles.heroStacked,
          ]}
        >
          <View
            style={[
              styles.copy,
              stacked && styles.copyStacked,
            ]}
          >
            <Text style={styles.eyebrow}>
              A LITTLE HELP, ANYTIME
            </Text>

            <View style={styles.titleRow}>
              <Text style={styles.title}>
                Meet <Text style={styles.novaName}>Nova</Text>
              </Text>

              <Text style={styles.aiBadge}>AI</Text>
            </View>

            <Text style={styles.description}>
              Your space to ask, explore
              {"\n"}
              and understand.
            </Text>
          </View>

          {/* Transparent Lottie area — no circle or icon container */}
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.animationArea,
              {
                width: animationSize,
                height: animationSize,
              },
            ]}
          >
            {animationFailed || reduceMotion ? (
              <Ionicons
                name="sparkles-outline"
                size={40}
                color="#9788BF"
              />
            ) : (
              <LottieView
                ref={animationRef}
                source={AI_ANIMATION}
                autoPlay={false}
                loop
                speed={0.85}
                resizeMode="contain"
                onAnimationLoaded={syncPlayback}
                onAnimationFailure={() => setAnimationFailed(true)}
                style={styles.animation}
              />
            )}
          </View>
        </View>

        {/* Entire card opens Nova */}
        <View style={styles.search}>
          <Ionicons
            name="search-outline"
            size={19}
            color="#9489A5"
          />

          <Text style={styles.placeholder}>
            What would you like to learn?
          </Text>

          <View style={styles.arrow}>
            <Ionicons
              name="arrow-forward"
              size={19}
              color="#796498"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={13}
            color="#948AA3"
          />

          <Text style={styles.footerText}>
            Start with a question.
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 22,
  },

  card: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ECE8F2",
    backgroundColor: "#FAF8FD",
  },

  cardPressed: {
    backgroundColor: "#F5F1FA",
  },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heroStacked: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },

  copy: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
  },

  copyStacked: {
    flex: 0,
    width: "100%",
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#8D829C",
    marginBottom: 9,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  title: {
    flexShrink: 1,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: "#3E354B",
  },

  novaName: {
    fontWeight: "800",
    color: "#79609F",
  },

  aiBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#F0EBF7",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: "#88739F",
  },

  description: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 19,
    color: "#82798E",
  },

  animationArea: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  animation: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },

  search: {
    marginTop: 16,
    minHeight: 53,
    paddingVertical: 9,
    paddingLeft: 13,
    paddingRight: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDE9F3",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  placeholder: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 19,
    color: "#8C8299",
  },

  arrow: {
    width: 33,
    height: 33,
    borderRadius: 11,
    backgroundColor: "#F2EDF8",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  footerText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: "#948AA3",
  },
});
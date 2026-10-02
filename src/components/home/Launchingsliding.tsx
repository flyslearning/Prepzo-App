import React, { useEffect, useRef, useState } from "react";

import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useIsFocused } from "@react-navigation/native";

const MESSAGE = "Launching on 15 December 2026";
const SPEED = 40; // Pixels per second
const GAP = 48;

export default function Launchingsliding() {
  const focused = useIsFocused();

  const translateX = useRef(new Animated.Value(0)).current;

  const [width, setWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [foreground, setForeground] = useState(
    AppState.currentState === "active"
  );

  const segmentWidth = Math.max(width, textWidth + GAP);

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

  useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);

    if (
      width <= 0 ||
      textWidth <= 0 ||
      !focused ||
      !foreground ||
      reduceMotion
    ) {
      return;
    }

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -segmentWidth,
        duration: (segmentWidth / SPEED) * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [
    width,
    textWidth,
    segmentWidth,
    focused,
    foreground,
    reduceMotion,
    translateX,
  ]);

  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={MESSAGE}
        style={styles.banner}
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          setWidth((previous) =>
            Math.abs(previous - nextWidth) > 0.5
              ? nextWidth
              : previous
          );
        }}
      >
        {/* Measure the full text without constraining its width. */}
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.measurement}
        >
          <Text
            style={styles.message}
            onLayout={(event) => {
              setTextWidth(event.nativeEvent.layout.width);
            }}
          >
            {MESSAGE}
          </Text>
        </ScrollView>

        {reduceMotion || !textWidth ? (
          <Text style={[styles.message, styles.staticMessage]}>
            {MESSAGE}
          </Text>
        ) : (
          <Animated.View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.track,
              {
                width: segmentWidth * 2,
                transform: [{ translateX }],
              },
            ]}
          >
            {[0, 1].map((item) => (
              <View
                key={item}
                style={[
                  styles.segment,
                  { width: segmentWidth },
                ]}
              >
                <Text numberOfLines={1} style={styles.message}>
                  {MESSAGE}
                </Text>

                <View style={styles.dot} />
              </View>
            ))}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
    marginBottom: 12,
  },

  banner: {
    minHeight: 46,
    justifyContent: "center",
    backgroundColor: "#DC2626",
    borderRadius: 14,
    overflow: "hidden",
  },

  track: {
    flexDirection: "row",
    alignItems: "center",
  },

  segment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 14,
  },

  message: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#FFFFFF",
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FECACA",
  },

  staticMessage: {
    flexShrink: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlign: "center",
  },

  measurement: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
  },
});
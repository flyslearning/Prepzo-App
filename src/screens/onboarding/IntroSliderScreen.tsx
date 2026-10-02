import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import LottieView from "lottie-react-native";
import { AppStorage } from "../../storage/appStorage";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Smart Test Practice",
    subtitle:
      "Create chapter-wise and topic-wise tests with real exam practice experience.",
    animation: require("../../assets/animations/test.json"),
  },
  {
    id: "2",
    title: "Daily DPP Practice",
    subtitle:
      "Solve daily practice problems and build consistency for NEET, JEE and school exams.",
    animation: require("../../assets/animations/ebook.json"),
  },
  {
    id: "3",
    title: "Track Your Growth",
    subtitle:
      "Analyze your accuracy, progress, weak topics and improve your score every day.",
    animation: require("../../assets/animations/growth.json"),
  },
];

export default function IntroSliderScreen({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList>(null);

  const completeIntro = async () => {
    await AppStorage.setHasSeenOnboarding();
    onFinish();
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goNext = async () => {
    animateButton();

    if (index === slides.length - 1) {
      await completeIntro();
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: index + 1,
      animated: true,
    });
  };

  const renderItem = ({ item, index: i }: any) => {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [90, 0, 90],
      extrapolate: "clamp",
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.slide}>
        <Animated.View
          style={[
            styles.animationBox,
            {
              opacity,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={styles.lottie}
          />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity }]}>
          {item.title}
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity }]}>
          {item.subtitle}
        </Animated.Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Animated.View style={[styles.circle, styles.topCircle]} />
      <Animated.View style={[styles.circle, styles.bottomCircle]} />
      <Animated.View style={[styles.circleSmall, styles.leftCircle]} />
      <Animated.View style={[styles.circleSmall, styles.rightCircle]} />

      <TouchableOpacity style={styles.skipButton} onPress={completeIntro}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.brandBox}>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onMomentumScrollEnd={(event) => {
          const currentIndex = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setIndex(currentIndex);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const dotScale = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ],
              outputRange: [0.8, 1.5, 0.8],
              extrapolate: "clamp",
            });

            const dotWidth = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ],
              outputRange: [10, 24, 10],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    transform: [{ scale: dotScale }],
                  },
                ]}
              />
            );
          })}
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextText}>
              {index === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  circle: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 200,
    backgroundColor: "#2563eb20",
  },

  circleSmall: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: "#60a5fa30",
  },

  topCircle: {
    top: -80,
    right: -60,
  },

  bottomCircle: {
    bottom: -100,
    left: -80,
  },

  leftCircle: {
    top: height * 0.3,
    left: -40,
  },

  rightCircle: {
    bottom: height * 0.25,
    right: -40,
  },

  skipButton: {
    position: "absolute",
    right: 22,
    top: 52,
    zIndex: 10,
  },

  skipText: {
    color: "#2563eb",
    fontFamily: "Geologica",
    fontSize: 15,
  },

  brandBox: {
    position: "absolute",
    top: 48,
    left: 22,
    zIndex: 10,
  },

  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  animationBox: {
    width: 285,
    height: 285,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  lottie: {
    width: 275,
    height: 275,
  },

  title: {
    fontSize: 27,
    fontFamily: "Bungee",
    color: "#0f172a",
    textAlign: "center",
    lineHeight: 36,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    fontFamily: "Geologica",
    marginTop: 12,
    lineHeight: 23,
    paddingHorizontal: 6,
  },

  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 56,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    height: 18,
  },

  dot: {
    height: 10,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    marginHorizontal: 6,
  },

  nextButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",

    shadowColor: "#2563eb",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  nextText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Bungee",
    letterSpacing: 0.7,
  },
});
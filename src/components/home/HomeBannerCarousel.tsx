import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AccessibilityInfo,
  AppState,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import type {
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

import { useIsFocused } from "@react-navigation/native";

const AUTO_SLIDE_DELAY = 2500;
const SETTLE_DELAY = 180;

const BANNERS: ImageSourcePropType[] = [
  require("../../assets/banner/1.png"),
  require("../../assets/banner/2.png"),
  require("../../assets/banner/3.png"),
  require("../../assets/banner/4.png"),
  require("../../assets/banner/5.png"),
  require("../../assets/banner/6.png"),
];

const TOTAL = BANNERS.length;

// Copies at both ends allow seamless looping.
const SLIDES = [
  BANNERS[TOTAL - 1],
  ...BANNERS,
  BANNERS[0],
];

type BannerRoute =
  | "CreateTest"
  | "CreateDpp"
  | "RevisionFolder";

type Props = {
  // Preserves compatibility with your existing HomeScreen.
  onOpen?: (route: BannerRoute) => void;
};

export default function HomeBannerCarousel(_props: Props) {
  const focused = useIsFocused();

  const scrollRef = useRef<ScrollView>(null);

  const widthRef = useRef(0);
  const pageRef = useRef(1);
  const offsetRef = useRef(0);
  const touchingRef = useRef(false);

  const autoTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const settleTimer = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [settled, setSettled] = useState(true);
  const [revision, setRevision] = useState(0);

  const [foreground, setForeground] = useState(
    AppState.currentState === "active"
  );

  const [reduceMotion, setReduceMotion] = useState(true);
  const [screenReader, setScreenReader] = useState(true);

  // Keep this object stable when the active dot changes.
  const initialOffset = useMemo(
    () => ({
      x: pageRef.current * width,
      y: 0,
    }),
    [width]
  );

  function clearAutoTimer() {
    if (autoTimer.current !== null) {
      clearTimeout(autoTimer.current);
      autoTimer.current = null;
    }
  }

  function clearSettleTimer() {
    if (settleTimer.current !== null) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  }

  function finishScroll() {
    clearSettleTimer();

    if (touchingRef.current || widthRef.current <= 0) {
      return;
    }

    const pageWidth = widthRef.current;

    const position = Math.max(
      0,
      Math.min(
        TOTAL + 1,
        Math.round(offsetRef.current / pageWidth)
      )
    );

    let realPage = position;

    if (position === 0) {
      realPage = TOTAL;
    } else if (position === TOTAL + 1) {
      realPage = 1;
    }

    pageRef.current = realPage;

    const destination = realPage * pageWidth;

    // Jump from a duplicate to its identical original.
    if (Math.abs(offsetRef.current - destination) > 0.5) {
      offsetRef.current = destination;

      scrollRef.current?.scrollTo({
        x: destination,
        animated: false,
      });
    }

    setActiveIndex(realPage - 1);
    setSettled(true);
    setRevision((value) => value + 1);
  }

  function scheduleSettle() {
    clearSettleTimer();

    settleTimer.current = setTimeout(
      finishScroll,
      SETTLE_DELAY
    );
  }

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});

    AccessibilityInfo.isScreenReaderEnabled()
      .then((enabled) => {
        if (mounted) setScreenReader(enabled);
      })
      .catch(() => {});

    const motionSubscription =
      AccessibilityInfo.addEventListener(
        "reduceMotionChanged",
        setReduceMotion
      );

    const readerSubscription =
      AccessibilityInfo.addEventListener(
        "screenReaderChanged",
        setScreenReader
      );

    const appSubscription = AppState.addEventListener(
      "change",
      (state) => {
        setForeground(state === "active");
      }
    );

    return () => {
      mounted = false;

      motionSubscription.remove();
      readerSubscription.remove();
      appSubscription.remove();

      clearAutoTimer();
      clearSettleTimer();
    };
  }, []);

  // Preserve the current banner after a layout change.
  useEffect(() => {
    if (width <= 0) return;

    clearAutoTimer();
    clearSettleTimer();

    widthRef.current = width;
    touchingRef.current = false;
    offsetRef.current = pageRef.current * width;

    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: offsetRef.current,
        animated: false,
      });

      setSettled(true);
      setRevision((value) => value + 1);
    });

    return () => cancelAnimationFrame(frame);
  }, [width]);

  useEffect(() => {
    clearAutoTimer();

    if (
      width <= 0 ||
      !focused ||
      !foreground ||
      !settled ||
      reduceMotion ||
      screenReader
    ) {
      return;
    }

    autoTimer.current = setTimeout(() => {
      if (touchingRef.current || !scrollRef.current) {
        return;
      }

      setSettled(false);

      scrollRef.current.scrollTo({
        x: (pageRef.current + 1) * widthRef.current,
        animated: true,
      });
    }, AUTO_SLIDE_DELAY);

    return clearAutoTimer;
  }, [
    width,
    focused,
    foreground,
    settled,
    revision,
    reduceMotion,
    screenReader,
  ]);

  function handleScroll(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    offsetRef.current = event.nativeEvent.contentOffset.x;

    if (!touchingRef.current) {
      scheduleSettle();
    }
  }

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;

        setWidth((previous) =>
          Math.abs(previous - nextWidth) > 0.5
            ? nextWidth
            : previous
        );
      }}
    >
      {/* Images only */}
      <View style={styles.frame}>
        {width > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            bounces={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            contentInsetAdjustmentBehavior="never"
            contentOffset={initialOffset}
            onTouchStart={() => {
              touchingRef.current = true;
              clearAutoTimer();
              clearSettleTimer();
              setSettled(false);
            }}
            onTouchEnd={() => {
              touchingRef.current = false;
              scheduleSettle();
            }}
            onTouchCancel={() => {
              touchingRef.current = false;
              scheduleSettle();
            }}
            onScrollBeginDrag={() => {
              clearAutoTimer();
              clearSettleTimer();
              setSettled(false);
            }}
            onScrollEndDrag={() => {
              touchingRef.current = false;
              scheduleSettle();
            }}
            onScroll={handleScroll}
            onMomentumScrollEnd={(event) => {
              offsetRef.current =
                event.nativeEvent.contentOffset.x;

              finishScroll();
            }}
          >
            {SLIDES.map((source, index) => {
              const imageNumber =
                index === 0
                  ? TOTAL
                  : index === TOTAL + 1
                    ? 1
                    : index;

              return (
                <View
                  key={`banner-${index}`}
                  style={{
                    width,
                    aspectRatio: 16 / 7,
                  }}
                >
                  <Image
                    source={source}
                    resizeMode="contain"
                    style={styles.image}
                    accessibilityLabel={
                      `Prepzo banner ${imageNumber} of ${TOTAL}`
                    }
                  />
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Active banner indicator */}
      <View
        accessible
        accessibilityLabel={
          `Banner ${activeIndex + 1} of ${TOTAL}`
        }
        style={styles.dotsRow}
      >
        {BANNERS.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              activeIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 4,
  },

  frame: {
    width: "100%",
    aspectRatio: 16 / 7,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F5F7FB",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  dotsRow: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D5DDEB",
  },

  activeDot: {
    width: 19,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
});
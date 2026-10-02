import React from "react";

import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import HomeScreen from "../screens/home/HomeScreen";
import MyTestsScreen from "../screens/generator/MyTestsScreen";
import MyDppsScreen from "../screens/generator/MyDppsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SwipeScreen from "../screens/generator/SwipeScreen";

import {
  BottomTabParamList,
} from "./types";


const Tab =
  createBottomTabNavigator<BottomTabParamList>();


const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#EFF6FF",

  background: "#F8FAFC",

  white: "#FFFFFF",

  text: "#0F172A",
  muted: "#94A3B8",

  border: "#E2E8F0",

  shadow: "#0F172A",
};


/* -------------------------------------------------------------------------- */
/*                               Swipe Button                                 */
/* -------------------------------------------------------------------------- */

function SwipeTabButton(
  props: BottomTabBarButtonProps,
) {
  const {
    onPress,
    onLongPress,
    accessibilityState,
  } = props;

  const focused =
    accessibilityState?.selected ?? false;

  return (
    <View style={styles.swipeWrapper}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.swipeButton,
          focused && styles.swipeButtonActive,
          pressed && styles.swipeButtonPressed,
        ]}
      >
        <Ionicons
          name="swap-horizontal"
          size={27}
          color={COLORS.white}
        />
      </Pressable>

      <Text
        style={[
          styles.swipeLabel,
          focused &&
            styles.swipeLabelActive,
        ]}
      >
        Swipe
      </Text>
    </View>
  );
}


/* -------------------------------------------------------------------------- */
/*                           Bottom Tab Navigator                             */
/* -------------------------------------------------------------------------- */

export default function BottomTabNavigator() {
  const insets =
    useSafeAreaInsets();

  const {
    width,
  } = useWindowDimensions();


  const isSmallDevice =
    width < 360;

  const isLargeDevice =
    width >= 430;


  const tabBarHeight =
    Platform.OS === "ios"
      ? 64 + insets.bottom
      : 64 + Math.max(insets.bottom, 6);


  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor:
          COLORS.primary,

        tabBarInactiveTintColor:
          COLORS.muted,

        sceneStyle: {
          backgroundColor:
            COLORS.background,

          /*
          |--------------------------------------------------------------------------
          | Important
          |--------------------------------------------------------------------------
          |
          | Bottom screen content tab bar ke piche nahi jayega.
          |
          */

          paddingBottom: 4,
        },

        tabBarStyle: [
          styles.tabBar,

          {
            height: tabBarHeight,

            paddingBottom:
              Math.max(
                insets.bottom,
                Platform.OS === "android"
                  ? 7
                  : 3,
              ),
          },
        ],

        tabBarItemStyle: {
          paddingTop:
            isSmallDevice
              ? 4
              : 5,
        },

        tabBarLabelStyle: {
          fontSize:
            isSmallDevice
              ? 10
              : isLargeDevice
              ? 12
              : 11,

          fontWeight: "700",

          marginTop: 2,

          letterSpacing: 0.1,
        },

        tabBarIconStyle: {
          marginTop: 2,
        },

        tabBarIcon: ({
          color,
          focused,
        }) => {
          let iconName:
            keyof typeof Ionicons.glyphMap;


          switch (route.name) {
            case "Home":
              iconName =
                focused
                  ? "home"
                  : "home-outline";
              break;


            case "Test":
              iconName =
                focused
                  ? "document-text"
                  : "document-text-outline";
              break;


            case "Dpp":
              iconName =
                focused
                  ? "reader"
                  : "reader-outline";
              break;


            case "Profile":
              iconName =
                focused
                  ? "person"
                  : "person-outline";
              break;


            case "Swipe":
              iconName =
                "swap-horizontal";
              break;


            default:
              iconName =
                "ellipse-outline";
          }


          return (
            <View
              style={[
                styles.iconContainer,

                focused &&
                  route.name !==
                    "Swipe" &&
                  styles.iconContainerActive,
              ]}
            >
              <Ionicons
                name={iconName}
                size={
                  isSmallDevice
                    ? 21
                    : 23
                }
                color={color}
              />
            </View>
          );
        },
      })}
    >
      {/* HOME */}

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />


      {/* TEST */}

      <Tab.Screen
        name="Test"
        component={MyTestsScreen}
        options={{
          tabBarLabel: "Test",
        }}
      />


      {/* SWIPE - CENTER FLOATING BUTTON */}

      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{
          tabBarLabel: () => null,

          tabBarButton:
            (props) => (
              <SwipeTabButton
                {...props}
              />
            ),
        }}
      />


      {/* DPP */}

      <Tab.Screen
        name="Dpp"
        component={MyDppsScreen}
        options={{
          tabBarLabel: "DPP",
        }}
      />


      {/* PROFILE */}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}


/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const styles =
  StyleSheet.create({
    /*
    |--------------------------------------------------------------------------
    | Main Bottom Bar
    |--------------------------------------------------------------------------
    */

    tabBar: {
      backgroundColor:
        COLORS.white,

      borderTopWidth: 1,

      borderTopColor:
        COLORS.border,

      paddingTop: 5,

      elevation: 14,

      shadowColor:
        COLORS.shadow,

      shadowOffset: {
        width: 0,
        height: -4,
      },

      shadowOpacity: 0.07,

      shadowRadius: 12,
    },


    /*
    |--------------------------------------------------------------------------
    | Normal Tab Icon
    |--------------------------------------------------------------------------
    */

    iconContainer: {
      minWidth: 37,
      height: 32,

      paddingHorizontal: 8,

      borderRadius: 11,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    iconContainerActive: {
      backgroundColor:
        COLORS.primarySoft,
    },


    /*
    |--------------------------------------------------------------------------
    | Center Swipe
    |--------------------------------------------------------------------------
    */

    swipeWrapper: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "flex-start",

      position:
        "relative",
    },


    swipeButton: {
      position:
        "absolute",

      top: -25,

      width: 58,
      height: 58,

      borderRadius: 29,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        COLORS.primary,


      /*
      |--------------------------------------------------------------------------
      | Border
      |--------------------------------------------------------------------------
      */

      borderWidth: 5,

      borderColor:
        COLORS.white,


      /*
      |--------------------------------------------------------------------------
      | Android Shadow
      |--------------------------------------------------------------------------
      */

      elevation: 12,


      /*
      |--------------------------------------------------------------------------
      | iOS Shadow
      |--------------------------------------------------------------------------
      */

      shadowColor:
        COLORS.primaryDark,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity: 0.27,

      shadowRadius: 10,
    },


    swipeButtonActive: {
      backgroundColor:
        COLORS.primaryDark,

      transform: [
        {
          scale: 1.03,
        },
      ],
    },


    swipeButtonPressed: {
      transform: [
        {
          scale: 0.94,
        },
      ],
    },


    swipeLabel: {
      position:
        "absolute",

      top: 37,

      fontSize: 11,

      fontWeight: "700",

      color:
        COLORS.muted,

      letterSpacing: 0.1,
    },


    swipeLabelActive: {
      color:
        COLORS.primary,
    },
  });
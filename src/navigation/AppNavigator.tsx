import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";


import BottomTabNavigator from "./BottomTabNavigator";


import SessionsScreen from "../screens/profile/SessionsScreen";

import CreateTestScreen from "../screens/generator/CreateTestScreen";

import MyTestsScreen from "../screens/generator/MyTestsScreen";

import TestAttemptScreen from "../screens/generator/TestAttemptScreen";

import ResultScreen from "../screens/generator/ResultScreen";

import CreateDppScreen from "../screens/generator/CreateDppScreen";

import MistakesScreen from "../screens/generator/MistakesScreen";

import BookmarksScreen from "../screens/generator/BookmarksScreen";

import NotificationsScreen from "../screens/generator/NotificationsScreen";

import LeaderboardScreen from "../screens/generator/LeaderboardScreen";

import JoinBatchScreen from "../screens/generator/JoinBatchScreen";

import DppAttemptScreen from "../screens/generator/DppAttemptScreen";

import MyDppsScreen from "../screens/generator/MyDppsScreen";

import SearchQuestionsScreen from "../screens/generator/SearchQuestionsScreen";

import RevisionFolderScreen from "../screens/generator/RevisionFolderScreen";

import SharedTestScreen from "../screens/generator/SharedTestScreen";

import AdvancedGeneratorScreen from "../screens/generator/AdvancedGeneratorScreen";

import NovaScreen from "../screens/ai/NovaScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";


import {
  AppStackParamList,
} from "./types";


const Stack =
  createNativeStackNavigator<AppStackParamList>();


export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerBackTitle: "",
        headerShadowVisible: false,

        headerTitleStyle: {
          fontWeight: "700",
        },

        headerTintColor: "#0F172A",

        contentStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      {/*
      |--------------------------------------------------------------------------
      | Main Bottom Navigation
      |--------------------------------------------------------------------------
      */}

      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{
          headerShown: false,
        }}
      />


      {/*
      |--------------------------------------------------------------------------
      | Profile
      |--------------------------------------------------------------------------
      */}

      <Stack.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          title: "Active Sessions",
        }}
      />


      {/*
      |--------------------------------------------------------------------------
      | Test
      |--------------------------------------------------------------------------
      */}

      <Stack.Screen
        name="CreateTest"
        component={CreateTestScreen}
        options={{
          title: "Create Test",
        }}
      />

      <Stack.Screen
        name="MyTests"
        component={MyTestsScreen}
        options={{
          title: "My Tests",
        }}
      />

      <Stack.Screen
        name="TestAttempt"
        component={TestAttemptScreen}
        options={{
          headerShown: false,

          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{
          title: "Test Result",

          gestureEnabled: false,
        }}
      />


      {/*
      |--------------------------------------------------------------------------
      | DPP
      |--------------------------------------------------------------------------
      */}

      <Stack.Screen
        name="CreateDpp"
        component={CreateDppScreen}
        options={{
          title: "Create DPP",
        }}
      />

      <Stack.Screen
        name="MyDpps"
        component={MyDppsScreen}
        options={{
          title: "My DPPs",
        }}
      />

      <Stack.Screen
        name="DppAttempt"
        component={DppAttemptScreen}
        options={{
          headerShown: false,

          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Nova"
        component={NovaScreen}
        options={{
          title: "Nova",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#F8F9FD",
          },
        }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerShadowVisible: false,
        }}
      />


      {/*
      |--------------------------------------------------------------------------
      | Generator / Practice
      |--------------------------------------------------------------------------
      */}

      <Stack.Screen
        name="Mistakes"
        component={MistakesScreen}
        options={{
          title: "Mistakes",
        }}
      />

      <Stack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          title: "Bookmarks",
        }}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
        }}
      />

      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          title: "Leaderboard",
        }}
      />

      <Stack.Screen
        name="JoinBatch"
        component={JoinBatchScreen}
        options={{
          title: "Join Batch",
        }}
      />

      <Stack.Screen
        name="SearchQuestions"
        component={SearchQuestionsScreen}
        options={{
          title: "Search Questions",
        }}
      />

      <Stack.Screen
        name="RevisionFolder"
        component={RevisionFolderScreen}
        options={{
          title: "Revision Folder",
        }}
      />

      <Stack.Screen
        name="SharedTest"
        component={SharedTestScreen}
        options={{
          title: "Shared Test",
        }}
      />

      <Stack.Screen
        name="AdvancedGenerator"
        component={AdvancedGeneratorScreen}
        options={{
          title: "Advanced Generator",
        }}
      />
    </Stack.Navigator>
  );
}
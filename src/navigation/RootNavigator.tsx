import React, {
  useEffect,
  useState,
} from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import * as SplashScreen from "expo-splash-screen";


import {
  useAuthStore,
} from "../store/authStore";

import AuthNavigator from "./AuthNavigator";

import AppNavigator from "./AppNavigator";

import Loader from "../components/Loader";

import CompleteProfileScreen from "../screens/onboarding/CompleteProfileScreen";

import IntroSliderScreen from "../screens/onboarding/IntroSliderScreen";

import {
  AppStorage,
} from "../storage/appStorage";


SplashScreen.preventAutoHideAsync();


export default function RootNavigator() {
  const {
    loading,
    isLoggedIn,
    user,
    bootstrap,
  } = useAuthStore();


  const [
    appReady,
    setAppReady,
  ] = useState(false);


  const [
    hasSeenOnboarding,
    setHasSeenOnboarding,
  ] = useState(false);


  useEffect(() => {
    initApp();
  }, []);


  const initApp =
    async () => {
      try {
        const seen =
          await AppStorage
            .getHasSeenOnboarding();

        setHasSeenOnboarding(
          seen,
        );

        await bootstrap();
      } catch (error) {
        console.error(
          "App initialization failed:",
          error,
        );
      } finally {
        setAppReady(true);

        try {
          await SplashScreen
            .hideAsync();
        } catch {
          //
        }
      }
    };


  /*
  |--------------------------------------------------------------------------
  | App Booting
  |--------------------------------------------------------------------------
  */

  if (
    !appReady ||
    loading
  ) {
    return <Loader />;
  }


  /*
  |--------------------------------------------------------------------------
  | First Time Onboarding
  |--------------------------------------------------------------------------
  */

  if (!hasSeenOnboarding) {
    return (
      <IntroSliderScreen
        onFinish={() => {
          setHasSeenOnboarding(
            true,
          );
        }}
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <AuthNavigator />
      ) : !user?.profileCompleted ? (
        <CompleteProfileScreen />
      ) : (
        <AppNavigator />
      )}
    </NavigationContainer>
  );
}
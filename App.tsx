import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import RootNavigator from "./src/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadApp();
  }, []);

  const loadApp = async () => {
    try {
      await Font.loadAsync({
        Bungee: require("./src/assets/fonts/Bungee-Regular.ttf"),
        Geologica: require("./src/assets/fonts/Geologica.ttf"),
        TitanOne: require("./src/assets/fonts/TitanOne.ttf"),
      });
    } finally {
      setReady(true);
      await SplashScreen.hideAsync();
    }
  };

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
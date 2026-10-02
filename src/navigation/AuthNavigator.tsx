import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import OtpScreen from "../screens/auth/OtpScreen";


export type AuthStackParamList = {
  Login: undefined;

  Otp: {
    email: string;
  };
};


const Stack =
  createNativeStackNavigator<AuthStackParamList>();


export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Otp"
        component={OtpScreen}
      />
    </Stack.Navigator>
  );
}
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import LoginScreen from "./screens/LoginScreen";

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel: require("./assets/fonts/Cinzel-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <LoginScreen />;
}

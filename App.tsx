import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel: require("./assets/fonts/Cinzel-Regular.ttf"),
    Cormorant: require("./assets/fonts/static/CormorantGaramond-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <RegisterScreen />;
}

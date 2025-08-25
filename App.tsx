import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
// ⬇️ usa il path giusto in base a dove hai il file
import { startQueueMonitor } from "./utils/queueMonitor";
import Navigation from "./navigation/Navigation";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel: require("./assets/fonts/Cinzel-Regular.ttf"),
    Cormorant: require("./assets/fonts/static/CormorantGaramond-Regular.ttf"),
  });

  // 1) avvia il monitor una sola volta
  useEffect(() => {
    startQueueMonitor();
  }, []);

  // 2) quando i font sono pronti, nascondi lo splash
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // ⬇️ il return arriva SOLO dopo aver registrato gli hook
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

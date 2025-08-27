import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { startQueueMonitor } from "./utils/queueMonitor";
import Navigation from "./navigation/Navigation";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  ensureNotificationPerms,
  configureAndroidChannels,
} from "./utils/notify";

// Puoi lasciarlo qui: non è un hook
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel: require("./assets/fonts/Cinzel-Regular.ttf"),
    Cormorant: require("./assets/fonts/static/CormorantGaramond-Regular.ttf"),
  });

  // 1) Permessi + canali notifiche (solo una volta)
  useEffect(() => {
    ensureNotificationPerms();
    configureAndroidChannels();
  }, []);

  // 2) Avvia monitor coda (solo una volta)
  useEffect(() => {
    startQueueMonitor();
  }, []);

  // 3) Nascondi splash quando i font sono pronti
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

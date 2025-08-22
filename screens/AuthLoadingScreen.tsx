import React, { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  InteractionManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigation";
import { getItem } from "../utils/secureStore";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AuthLoadingScreen"
>;

export default function AuthLoadingScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    let isActive = true;

    // Esegue il check *dopo* che il frame è pronto, evita flash e race con il navigator
    const task = InteractionManager.runAfterInteractions(async () => {
      try {
        // Usa la tua chiave reale: qui controlliamo entrambe per sicurezza
        const [username, token] = await Promise.all([
          getItem("username"),
          getItem("authToken"),
        ]);

        if (!isActive) return;

        const isLoggedIn = Boolean(username || token);

        if (isLoggedIn) {
          // DEBUG opzionale:
          // console.log("[AuthLoading] logged-in as:", username);
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        } else {
          // console.log("[AuthLoading] not logged-in → Login");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }
      } catch (e) {
        console.warn("Errore nel controllo login:", e);
        if (!isActive) return;
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    });

    return () => {
      isActive = false;
      task.cancel();
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3a602a" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8e9ea",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useColors } from "../src/theme/ThemeContext";
import Navbar from "../components/Navbar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { Star, ExternalLink } from "lucide-react-native";

type Borgo = {
  id: string;
  name: string;
  regionId: string;
  provinceCode?: string;
  lat: number;
  lng: number;
};

export default function BorgoDetailScreen() {
  const route = useRoute<RouteProp<{ params: { borgo: Borgo } }, "params">>();
  const { borgo } = route.params;
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, 16) + 24;

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const savedList = await SecureStore.getItemAsync("borghi_salvati");
      if (savedList) {
        const arr = JSON.parse(savedList);
        setSaved(arr.includes(borgo.id));
      }
    })();
  }, []);

  const toggleSalva = async () => {
    const salvatiRaw = await SecureStore.getItemAsync("borghi_salvati");
    const salvati = salvatiRaw ? JSON.parse(salvatiRaw) : [];
    let aggiornati;

    if (salvati.includes(borgo.id)) {
      aggiornati = salvati.filter((id: string) => id !== borgo.id);
      setSaved(false);
    } else {
      aggiornati = [...salvati, borgo.id];
      setSaved(true);
    }

    await SecureStore.setItemAsync(
      "borghi_salvati",
      JSON.stringify(aggiornati)
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.content, { paddingTop }]}>
        <Text style={[styles.title, { color: colors.text }]}>{borgo.name}</Text>

        <Text style={[styles.region, { color: colors.sub }]}>
          {borgo.regionId}
          {borgo.provinceCode ? ` – ${borgo.provinceCode.toUpperCase()}` : ""}
        </Text>

        {/* Pulsanti azione */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={toggleSalva} style={styles.actionBtn}>
            <Star
              size={20}
              color={saved ? colors.tint : colors.sub}
              fill={saved ? colors.tint : "none"}
            />
            <Text style={[styles.actionText, { color: colors.text }]}>
              {saved ? "Salvato" : "Salva per dopo"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://it.wikipedia.org/wiki/${encodeURIComponent(
                  borgo.name
                )}`
              )
            }
            style={styles.actionBtn}
          >
            <ExternalLink size={20} color={colors.tint} />
            <Text style={[styles.actionText, { color: colors.tint }]}>
              Wikipedia
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: "Cinzel",
    marginBottom: 6,
    textAlign: "center",
  },
  region: {
    fontSize: 16,
    fontFamily: "Cormorant",
    textAlign: "center",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  actionText: {
    fontFamily: "Cormorant",
    fontSize: 16,
  },
});

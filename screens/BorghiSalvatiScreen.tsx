import React, { use, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useColors, useTopPad } from "../src/theme/ThemeContext";
import Navbar from "../components/Navbar";
import borghiData from "../assets/data/borghi_min.json";
import { useNavigation } from "@react-navigation/native";
import { getSavedBorghi } from "../utils/borghiStorage";
import { ArrowLeft } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function BorghiSalvatiScreen() {
  const colors = useColors();
  const topPad = useTopPad();
  const navigation = useNavigation();
  const [savedBorghi, setSavedBorghi] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const savedIds = await getSavedBorghi();
        const found = borghiData.filter((b) => savedIds.includes(b.id));
        setSavedBorghi(found);
      })();
    }, [])
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: topPad,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Borghi salvati
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
        data={savedBorghi}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("BorgoDetail", { borgo: item })}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.name, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.sub, { color: colors.sub }]}>
              {item.regionId}
              {item.provinceCode ? ` – ${item.provinceCode.toUpperCase()}` : ""}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: colors.sub,
              fontFamily: "Cormorant",
              textAlign: "center",
              marginTop: 40,
            }}
          >
            Nessun borgo salvato per ora.
          </Text>
        }
      />

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontFamily: "Cinzel",
  },
  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  name: {
    fontFamily: "Cinzel",
    fontSize: 16,
    marginBottom: 4,
  },
  sub: {
    fontFamily: "Cormorant",
    fontSize: 14,
  },
});

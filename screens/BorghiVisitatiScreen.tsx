import React, { useEffect, useState } from "react";
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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getVisitedBorghi } from "../utils/borghiStorage";
import { ArrowLeft } from "lucide-react-native";

export default function BorghiVisitatiScreen() {
  const colors = useColors();
  const topPad = useTopPad();
  const navigation = useNavigation();
  const [visitedBorghi, setVisitedBorghi] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const visitedIds = await getVisitedBorghi();
        const found = borghiData.filter((b) => visitedIds.includes(b.id));
        setVisitedBorghi(found);
      })();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: topPad,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Borghi visitati
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        data={visitedBorghi}
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
            Nessun borgo visitato per ora.
          </Text>
        }
      />

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
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

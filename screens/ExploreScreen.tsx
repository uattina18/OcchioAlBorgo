import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useColors } from "../src/theme/ThemeContext";
import { useTopPad } from "../src/theme/ThemeContext";
import Navbar from "../components/Navbar";
import borghiData from "../assets/data/borghi_min.json";
import { useNavigation } from "@react-navigation/native";
import { toggleBorgo, isBorgoSaved } from "../utils/borghiStorage";

export default function ExploreScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const topPad = useTopPad();

  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const regioni = ["all", "liguria", "piemonte", "toscana"];

  const handleSearch = (text: string) => {
    setQuery(text);
    setSearched(true);

    const res = borghiData.filter((b) => {
      const matchName = b.name.toLowerCase().includes(text.toLowerCase());
      const matchRegion =
        selectedRegion === "all" || b.regionId === selectedRegion;
      return matchName && matchRegion;
    });

    setResults(res);
  };

  const BorgoItem = ({ item }: { item: any }) => {
    const [saved, setSaved] = useState(false);

    useEffect(() => {
      isBorgoSaved(item.id).then(setSaved);
    }, []);

    const toggleSave = async () => {
      await toggleBorgo(item.id);
      setSaved((prev) => !prev);
    };

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("BorgoDetail", { borgo: item })}
      >
        <View style={[styles.borgoCard, { backgroundColor: colors.card }]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Text style={[styles.borgoName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.borgoRegion, { color: colors.sub }]}>
                {item.regionId}
                {item.provinceCode
                  ? ` – ${item.provinceCode.toUpperCase()}`
                  : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleSave}>
              <Text style={{ fontSize: 18 }}>{saved ? "🔖" : "📑"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.content, { paddingTop: topPad }]}>
        <Text style={[styles.title, { color: colors.text }]}>Esplora</Text>

        {/* Filtro per regione */}
        <View style={styles.regionFilters}>
          {regioni.map((reg) => (
            <TouchableOpacity
              key={reg}
              onPress={() => {
                setSelectedRegion(reg);
                handleSearch(query);
              }}
              style={[
                styles.regionButton,
                {
                  backgroundColor:
                    selectedRegion === reg ? colors.tint : colors.card,
                },
              ]}
            >
              <Text
                style={{
                  color: selectedRegion === reg ? "#fff" : colors.text,
                  fontFamily: "Cormorant",
                }}
              >
                {reg === "all"
                  ? "Tutte"
                  : reg.charAt(0).toUpperCase() + reg.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Campo di ricerca */}
        <TextInput
          style={[
            styles.searchInput,
            { borderColor: colors.hr, color: colors.text },
          ]}
          placeholder="Cerca un borgo"
          placeholderTextColor={colors.sub}
          value={query}
          onChangeText={handleSearch}
        />

        {/* Risultati */}
        {searched ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item }) => <BorgoItem item={item} />}
            ListEmptyComponent={
              <Text style={{ color: colors.sub, marginTop: 16 }}>
                Nessun borgo trovato.
              </Text>
            }
          />
        ) : (
          <Text
            style={{ color: colors.sub, marginTop: 16, textAlign: "center" }}
          >
            Cerca un borgo per iniziare
          </Text>
        )}
      </View>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: "Cinzel",
    marginBottom: 10,
    textAlign: "center",
  },
  regionFilters: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  regionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontFamily: "Cormorant",
    fontSize: 16,
    marginBottom: 16,
  },
  borgoCard: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  borgoName: {
    fontFamily: "Cinzel",
    fontSize: 16,
    marginBottom: 4,
  },
  borgoRegion: {
    fontFamily: "Cormorant",
    fontSize: 14,
  },
});

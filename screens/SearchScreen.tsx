// screens/SearchScreen.tsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { X } from "lucide-react-native";
import borghiData from "../assets/data/borghi_min.json";
import { useColors } from "../src/theme/ThemeContext";

const uniqueRegions = Array.from(
  new Set(borghiData.map((b) => b.regionId))
).sort();

export default function SearchScreen() {
  const colors = useColors();
  const nav = useNavigation();
  const route = useRoute();
  const initialQuery = route.params?.query || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    handleSearch(initialQuery);
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    const filtered = borghiData.filter((b) => {
      const matchesQuery = b.name.toLowerCase().includes(text.toLowerCase());
      const matchesRegion = selectedRegion
        ? b.regionId === selectedRegion
        : true;
      return matchesQuery && matchesRegion;
    });
    setResults(filtered);
  };

  const handleRegionFilter = (regionId: string | null) => {
    setSelectedRegion(regionId);
    const filtered = borghiData.filter((b) => {
      const matchesQuery = b.name.toLowerCase().includes(query.toLowerCase());
      const matchesRegion = regionId ? b.regionId === regionId : true;
      return matchesQuery && matchesRegion;
    });
    setResults(filtered);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.hr }]}
          placeholder="Cerca un borgo"
          placeholderTextColor={colors.sub}
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.regionScroll}
      >
        <TouchableOpacity
          onPress={() => handleRegionFilter(null)}
          style={styles.regionFilterBtn}
        >
          <Text
            style={[
              styles.regionText,
              { color: selectedRegion === null ? colors.tint : colors.sub },
            ]}
          >
            Tutte
          </Text>
        </TouchableOpacity>
        {uniqueRegions.map((regionId) => (
          <TouchableOpacity
            key={regionId}
            onPress={() => handleRegionFilter(regionId)}
            style={styles.regionFilterBtn}
          >
            <Text
              style={[
                styles.regionText,
                {
                  color: selectedRegion === regionId ? colors.tint : colors.sub,
                },
              ]}
            >
              {regionId}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsContainer}
        renderItem={({ item }) => (
          <View style={[styles.borgoCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.borgoName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.borgoRegion, { color: colors.sub }]}>
              {item.regionId}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{ color: colors.sub, marginTop: 16, textAlign: "center" }}
          >
            Nessun borgo trovato.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontFamily: "Cormorant",
    fontSize: 16,
  },
  regionScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  regionFilterBtn: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  regionText: {
    fontFamily: "Cormorant",
    fontSize: 14,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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

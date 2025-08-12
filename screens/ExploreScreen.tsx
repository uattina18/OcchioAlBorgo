import React from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import Navbar from "../components/Navbar";

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Esplora</Text>
        <Text style={styles.subtitles}>
          Qui compariranno i borghi e gli eventi da esplorare
        </Text>
      </View>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8e9ea",
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 50, // Spazio dal bordo superiore
  },
  title: {
    fontSize: 22,
    fontFamily: "Cinzel",
    color: "#000",
    marginBottom: 10,
  },
  subtitles: {
    fontSize: 16,
    fontFamily: "Cormorant",
    color: "#555",
  },
});

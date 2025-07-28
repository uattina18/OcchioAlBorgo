import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function HomeScreen() {
  const [nomeUtente, setNomeUtente] = useState<string | null>(null);

  useEffect(() => {
    const loadNome = async () => {
      const nomeSalvato = await SecureStore.getItemAsync("nome");
      setNomeUtente(nomeSalvato);
    };
    loadNome();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* BLOCCO 1: Header con saluto personalizzato */}
        <View style={styles.header}>
          <Text style={StyleSheet.greeting}>
            {nomeUtente ? `Bentornata, ${nomeUtente}!` : "Bentornata!"}
          </Text>
        </View>

        {/*Blocchi successivi */}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8e9ea",
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  greeting: {
    fontSize: 22,
    fontFamily: "Cinzel",
    color: "#000",
  },
});

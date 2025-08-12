import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import Navbar from "../components/Navbar";
import eventiData from "../assets/data/eventi_liguria.json";

export default function HomeScreen() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadUsername = async () => {
      const salvato = await SecureStore.getItemAsync("username");
      setUsername(salvato);
    };
    loadUsername();
    initBadges();
  }, []);

  const renderEventi = () => {
    const today = new Date();

    const eventiFuturi = eventiData
      .filter((evento) => {
        const match = evento["Event Date"]?.match(/\d{2}\/\d{2}\/\d{4}/);
        if (!match) return false;
        const eventDate = new Date(match[0].split("/").reverse().join("-"));
        return eventDate >= today && evento.Region === "Liguria";
      })
      .sort((a, b) => {
        const da = new Date(
          a["Event Date"]
            .match(/\d{2}\/\d{2}\/\d{4}/)[0]
            .split("/")
            .reverse()
            .join("-")
        );
        const db = new Date(
          b["Event Date"]
            .match(/\d{2}\/\d{2}\/\d{4}/)[0]
            .split("/")
            .reverse()
            .join("-")
        );
        return da.getTime() - db.getTime();
      })
      .slice(0, 3);

    if (eventiFuturi.length === 0) {
      return (
        <Text style={styles.noEventText}>
          Nessun evento disponibile al momento.
        </Text>
      );
    }

    return eventiFuturi.map((evento, index) => (
      <TouchableOpacity
        key={index}
        style={styles.eventCard}
        onPress={() => Linking.openURL(evento["Event Link"])}
      >
        <Image
          source={{ uri: evento["Event Image"] }}
          style={styles.eventImage}
        />
        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>{evento["Event Title"]}</Text>
          <Text style={styles.eventDate}>📍 {evento.City}</Text>
          <Text style={styles.eventDate}>📅 {evento["Event Date"]}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {username ? `Bentornata, ${username}!` : "Bentornata!"}
          </Text>
          <TouchableOpacity style={styles.avatar}>
            <Image
              source={require("../assets/images/avatar_placeholder.png")}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ultimo borgo visitato</Text>
          <View style={styles.borgoBox}>
            <Image
              source={require("../assets/images/borgo_placeholder.png")}
              style={styles.borgoImage}
            />
            <Text style={styles.borgoDate}>22 apr 2024</Text>
            <Text style={styles.borgoName}>Fosdinovo</Text>
          </View>
          <TouchableOpacity style={styles.scanButton}>
            <Text style={styles.scanText}>SCATTA UN NUOVO BORGO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eventi in arrivo</Text>
          {renderEventi()}
        </View>

        <View style={styles.badgeBox}>
          <Text style={styles.badgeBoxText}>
            HAI OTTENUTO UN NUOVO BADGE: "BORGO LOVER"
          </Text>
          <TouchableOpacity>
            <Text style={styles.badgeLink}>→ VEDI NEL TUO PROFILO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

const initBadges = async () => {
  const existing = await SecureStore.getItemAsync("badges");
  if (!existing) {
    const initialBadges = {
      primoBorgo: false,
      cinque_borghi: false,
      dieci_borghi: false,
      eventi_visitati: 0,
      selfie_fatti: 0,
      borghiVisitati: 0,
    };
    await SecureStore.setItemAsync("badges", JSON.stringify(initialBadges));
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e8e9ea" },
  scrollContainer: { padding: 20, paddingBottom: 120 },
  header: {
    marginTop: 40,
    marginBottom: 10,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontSize: 22, fontFamily: "Cinzel", color: "#000" },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "#ccc",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 32, height: 32, borderRadius: 16 },
  section: { marginTop: 30 },
  sectionTitle: { fontSize: 18, fontFamily: "Cinzel", marginBottom: 10 },
  borgoBox: { alignItems: "center" },
  borgoImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
    borderRadius: 8,
  },
  borgoDate: { fontFamily: "Cormorant", fontSize: 14, color: "#444" },
  borgoName: { fontFamily: "Cinzel", fontSize: 18, fontWeight: "bold" },
  scanButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  scanText: { color: "#fff", fontFamily: "Cinzel", fontSize: 14 },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  eventImage: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  eventInfo: { flex: 1, justifyContent: "center" },
  eventName: {
    fontFamily: "Cormorant",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eventDate: { fontFamily: "Cormorant", fontSize: 14, color: "#555" },
  noEventText: {
    fontFamily: "Cormorant",
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  badgeBox: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeBoxText: {
    fontFamily: "Cormorant",
    fontSize: 14,
    marginBottom: 8,
  },
  badgeLink: {
    fontFamily: "Cormorant",
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});

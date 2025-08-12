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
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import Navbar from "../components/Navbar";
import eventiData from "../assets/data/eventi_liguria.json";

/* ----------------- util per date italiane ----------------- */
const IT_MONTHS: Record<string, number> = {
  gennaio: 0,
  febbraio: 1,
  marzo: 2,
  aprile: 3,
  maggio: 4,
  giugno: 5,
  luglio: 6,
  agosto: 7,
  settembre: 8,
  ottobre: 9,
  novembre: 10,
  dicembre: 11,
};
function toMonthIndex(mStr: string) {
  return IT_MONTHS[mStr.trim().toLowerCase()];
}

/** Parser “vecchio” (testo italiano) – ricaviamo la data FINALE */
function parseItalianDateEnd(s: string): Date | null {
  if (!s || typeof s !== "string") return null;
  const str = s.trim();

  // es: "dal 30 Dicembre 2024 al 28 Dicembre 2025"
  let m = str.match(
    /dal\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})\s+al\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i
  );
  if (m) {
    const day = parseInt(m[4], 10);
    const monthIdx = toMonthIndex(m[5]);
    const year = parseInt(m[6], 10);
    if (Number.isFinite(day) && monthIdx >= 0 && year >= 1900 && year <= 2100) {
      return new Date(year, monthIdx, day);
    }
    return null;
  }

  // es: "dal 01 al 31 Agosto 2025"
  m = str.match(/dal\s+(\d{1,2})\s+al\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i);
  if (m) {
    const day = parseInt(m[2], 10);
    const monthIdx = toMonthIndex(m[3]);
    const year = parseInt(m[4], 10);
    if (Number.isFinite(day) && monthIdx >= 0 && year >= 1900 && year <= 2100) {
      return new Date(year, monthIdx, day);
    }
    return null;
  }

  // es: "dal 10 Luglio al 05 Settembre 2025"
  m = str.match(
    /dal\s+\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+al\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i
  );
  if (m) {
    const day = parseInt(m[1], 10);
    const monthIdx = toMonthIndex(m[2]);
    const year = parseInt(m[3], 10);
    if (Number.isFinite(day) && monthIdx >= 0 && year >= 1900 && year <= 2100) {
      return new Date(year, monthIdx, day);
    }
    return null;
  }

  // es: "16 Agosto 2025"
  m = str.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthIdx = toMonthIndex(m[2]);
    const year = parseInt(m[3], 10);
    if (Number.isFinite(day) && monthIdx >= 0 && year >= 1900 && year <= 2100) {
      return new Date(year, monthIdx, day);
    }
    return null;
  }

  return null;
}

/** Parser nuovo range tipo "dd/mm/yyyy - dd/mm/yyyy" (prende l'ultima) */
function parseEndFromRange(s: string): Date | null {
  if (!s) return null;
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?!.*\d)/); // ultima data
  if (!m) return null;
  let day = parseInt(m[1], 10);
  let month = parseInt(m[2], 10) - 1; // 0-based
  let year = parseInt(m[3], 10);
  if (year < 100) year += 2000;
  if (year < 1900 || year > 2100) return null;
  return new Date(year, month, day);
}

/** Sceglie il miglior modo per estrarre la data finale */
function getEndDateFromEvent(ev: any): Date | null {
  if (ev["event_dates-0"]) {
    const d = parseEndFromRange(ev["event_dates-0"]);
    if (d) return d;
  }
  if (ev["data"]) {
    const d = parseItalianDateEnd(ev["data"]);
    if (d) return d;
  }
  return null;
}

/** Apre una locandina/immagine in browser (fallback con Alert) */
async function openPoster(url: string, title?: string) {
  try {
    const can = await Linking.canOpenURL(url);
    if (can) await Linking.openURL(url);
    else Alert.alert(title || "Locandina", "Impossibile aprire il link.");
  } catch {
    Alert.alert(title || "Locandina", "Impossibile aprire il link.");
  }
}

/* ----------------- HomeScreen ----------------- */
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

    const eventiFuturi = (eventiData as any[])
      .map((ev) => {
        const end = getEndDateFromEvent(ev);
        return {
          title: ev["data-page-selector"] || ev["data2"] || "Evento",
          img: ev["image-0-src"] || ev["image-src"] || "",
          url:
            ev["data-page-selector-href"] || ev["web-scraper-start-url"] || "",
          endDate: end,
        };
      })
      .filter((ev) => ev.endDate && (ev.endDate as Date) >= today)
      .sort(
        (a, b) => (a.endDate as Date).getTime() - (b.endDate as Date).getTime()
      )
      .slice(0, 3);

    if (eventiFuturi.length === 0) {
      return (
        <Text style={styles.noEventText}>
          Nessun evento disponibile al momento.
        </Text>
      );
    }

    return eventiFuturi.map((ev, idx) => (
      <TouchableOpacity
        key={idx}
        style={styles.eventCard}
        activeOpacity={0.85}
        onPress={() => {
          if (ev.img) openPoster(ev.img, ev.title);
          else if (ev.url) Linking.openURL(ev.url);
        }}
        onLongPress={() => {
          if (ev.url) Linking.openURL(ev.url);
        }}
      >
        {ev.img ? (
          <Image source={{ uri: ev.img }} style={styles.eventImage} />
        ) : null}
        <View style={styles.eventInfo}>
          <Text style={styles.eventName} numberOfLines={2}>
            {ev.title}
          </Text>
          <Text style={styles.eventDate}>
            📅 Fino al{" "}
            {(ev.endDate as Date).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>

          <View style={styles.actionsRow}>
            <Text style={styles.posterHint}>
              {ev.img ? "Tocca per locandina" : "Tieni premuto per dettagli"}
            </Text>
            {!!ev.url && (
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => Linking.openURL(ev.url)}
              >
                <Text style={styles.detailsBtnText}>Dettagli</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header con saluto */}
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

        {/* Ultimo borgo visitato */}
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

        {/* Eventi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eventi in arrivo</Text>
          {renderEventi()}
        </View>

        {/* Badge placeholder */}
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

/* ----------------- init badges ----------------- */
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

/* ----------------- styles ----------------- */
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
  borgoImage: { width: 100, height: 100, marginBottom: 8, borderRadius: 8 },
  borgoDate: { fontFamily: "Cormorant", fontSize: 14, color: "#444" },
  borgoName: { fontFamily: "Cinzel", fontSize: 18, fontWeight: "bold" },
  scanButton: {
    backgroundColor: "#3a602a",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: "center",
  },
  scanText: { color: "#fff", fontFamily: "Cinzel", fontSize: 14 },

  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
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

  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  posterHint: {
    fontFamily: "Cormorant",
    fontSize: 12,
    color: "#777",
    flexShrink: 1,
    paddingRight: 8,
  },
  detailsBtn: {
    backgroundColor: "#3a602a",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  detailsBtnText: {
    color: "#fff",
    fontFamily: "Cinzel",
    fontSize: 12,
    letterSpacing: 0.2,
  },

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
    shadowColor: "#3a602a",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeBoxText: { fontFamily: "Cormorant", fontSize: 14, marginBottom: 8 },
  badgeLink: {
    fontFamily: "Cormorant",
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});

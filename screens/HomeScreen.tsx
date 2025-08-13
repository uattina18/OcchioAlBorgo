// src/screens/HomeScreen.tsx
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import { Settings, User as UserIcon } from "lucide-react-native";

import Navbar from "../components/Navbar";
import eventiData from "../assets/data/eventi_liguria.json";
import { useColors, useTheme } from "../src/theme/ThemeContext";
import { RootStackParamList } from "../navigation/Navigation";

/* ---------- tipi navigazione ---------- */
type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

/* ---------- util date IT ---------- */
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
const toMonthIndex = (m: string) => IT_MONTHS[m.trim().toLowerCase()];

function parseItalianDateEnd(s: string): Date | null {
  if (!s || typeof s !== "string") return null;
  const str = s.trim();

  // "dal 30 Dicembre 2024 al 28 Dicembre 2025"
  let m = str.match(
    /dal\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})\s+al\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i
  );
  if (m)
    return new Date(parseInt(m[6], 10), toMonthIndex(m[5]), parseInt(m[4], 10));

  // "dal 01 al 31 Agosto 2025"
  m = str.match(/dal\s+(\d{1,2})\s+al\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i);
  if (m)
    return new Date(parseInt(m[4], 10), toMonthIndex(m[3]), parseInt(m[2], 10));

  // "dal 10 Luglio al 05 Settembre 2025"
  m = str.match(
    /dal\s+\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+al\s+(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i
  );
  if (m)
    return new Date(parseInt(m[3], 10), toMonthIndex(m[2]), parseInt(m[1], 10));

  // "16 Agosto 2025"
  m = str.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i);
  if (m)
    return new Date(parseInt(m[3], 10), toMonthIndex(m[2]), parseInt(m[1], 10));

  return null;
}

function parseEndFromRange(s: string): Date | null {
  if (!s) return null;
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?!.*\d)/); // ultima data nel range
  if (!m) return null;
  let day = parseInt(m[1], 10);
  let month = parseInt(m[2], 10) - 1;
  let year = parseInt(m[3], 10);
  if (year < 100) year += 2000;
  if (year < 1900 || year > 2100) return null;
  return new Date(year, month, day);
}

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

async function openPoster(url: string, title?: string) {
  try {
    const can = await Linking.canOpenURL(url);
    if (can) await Linking.openURL(url);
    else Alert.alert(title || "Locandina", "Impossibile aprire il link.");
  } catch {
    Alert.alert(title || "Locandina", "Impossibile aprire il link.");
  }
}

/* ---------- componente ---------- */
export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { theme } = useTheme();
  const colors = useColors();

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const salvato = await SecureStore.getItemAsync("username");
      setUsername(salvato);
    })();
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
        <Text style={[styles.noEventText, { color: colors.sub }]}>
          Nessun evento disponibile al momento.
        </Text>
      );
    }

    return eventiFuturi.map((ev, idx) => (
      <TouchableOpacity
        key={idx}
        style={[styles.eventCard, { backgroundColor: colors.card }]}
        activeOpacity={0.85}
        onPress={() => {
          if (ev.img) openPoster(ev.img, ev.title);
          else if (ev.url) Linking.openURL(ev.url);
        }}
        onLongPress={() => {
          if (ev.url) Linking.openURL(ev.url);
        }}
      >
        {/* niente riquadro: se img manca, non renderizzo */}
        {ev.img ? (
          <Image source={{ uri: ev.img }} style={styles.eventImage} />
        ) : null}

        <View style={[styles.eventInfo, !ev.img && { marginLeft: 0 }]}>
          <Text
            style={[styles.eventName, { color: colors.text }]}
            numberOfLines={2}
          >
            {ev.title}
          </Text>
          <Text style={[styles.eventDate, { color: colors.sub }]}>
            Fino al{" "}
            {(ev.endDate as Date).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>

          <View style={styles.actionsRow}>
            <Text style={[styles.posterHint, { color: colors.sub }]}>
              {ev.img ? "Tocca per locandina" : "Tieni premuto per dettagli"}
            </Text>
            {!!ev.url && (
              <TouchableOpacity
                style={[styles.detailsBtn, { backgroundColor: colors.tint }]}
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

  const circleBg = theme === "dark" ? "#2a2d2e" : "#d7d7d9";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Toolbar (icone sopra il saluto) */}
        <View style={styles.toolbar}>
          <View style={{ flex: 1 }} />
          <View style={styles.toolbarRight}>
            <TouchableOpacity
              style={[styles.iconCircle, { backgroundColor: circleBg }]}
              onPress={() => navigation.navigate("Profilo")}
              accessibilityLabel="Apri profilo"
            >
              <UserIcon size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconCircle,
                { marginLeft: 12, backgroundColor: circleBg },
              ]}
              onPress={() => navigation.navigate("SettingsScreen")}
              accessibilityLabel="Apri impostazioni"
            >
              <Settings size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Saluto: UNA riga, centrato, full width */}
        <Text
          style={[styles.greeting, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
        >
          {username ? `Bentornata, ${username}!` : "Bentornata!"}
        </Text>

        {/* Ultimo borgo visitato */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ultimo borgo visitato
          </Text>
          <View style={styles.borgoBox}>
            <Image
              source={require("../assets/images/borgo_placeholder.png")}
              style={styles.borgoImage}
            />
            <Text style={[styles.borgoDate, { color: colors.sub }]}>
              22 apr 2024
            </Text>
            <Text style={[styles.borgoName, { color: colors.text }]}>
              Fosdinovo
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: colors.tint }]}
          >
            <Text style={styles.scanText}>SCATTA UN NUOVO BORGO</Text>
          </TouchableOpacity>
        </View>

        {/* Eventi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Eventi in arrivo
          </Text>
          {renderEventi()}
        </View>

        {/* CTA: Segnala un evento */}
        <View
          style={[
            styles.reportBox,
            { backgroundColor: theme === "dark" ? "#1b1d1e" : "#f0f2f1" },
          ]}
        >
          <Text style={[styles.reportText, { color: colors.sub }]}>
            Manca un evento?
          </Text>
          <TouchableOpacity
            style={[styles.reportBtn, { backgroundColor: colors.tint }]}
            onPress={() => navigation.navigate("SegnalaEvento")}
          >
            <Text style={styles.reportBtnText}>Segnala un evento</Text>
          </TouchableOpacity>
        </View>

        {/* Badge placeholder */}
        <View style={[styles.badgeBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.badgeBoxText, { color: colors.text }]}>
            HAI OTTENUTO UN NUOVO BADGE: "BORGO LOVER"
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Profilo")}>
            <Text style={[styles.badgeLink, { color: "#007AFF" }]}>
              → VEDI NEL TUO PROFILO
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
}

/* ---------- init badges ---------- */
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

/* ---------- styles ---------- */
const ICON_BOX = 36;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 24,
  },

  // icone in alto a destra (sopra il saluto)
  toolbar: {
    marginTop: 32,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  toolbarRight: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: ICON_BOX / 2,
    alignItems: "center",
    justifyContent: "center",
  },

  // saluto
  greeting: {
    textAlign: "center",
    fontSize: 23,
    lineHeight: 30,
    fontFamily: "Cinzel",
    marginBottom: 8,
    paddingHorizontal: 10,
  },

  section: { marginTop: 28 },
  sectionTitle: { fontSize: 18, fontFamily: "Cinzel", marginBottom: 10 },

  borgoBox: { alignItems: "center" },
  borgoImage: { width: 100, height: 100, marginBottom: 8, borderRadius: 8 },
  borgoDate: { fontFamily: "Cormorant", fontSize: 14 },
  borgoName: { fontFamily: "Cinzel", fontSize: 18, fontWeight: "bold" },
  scanButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: "center",
  },
  scanText: { color: "#fff", fontFamily: "Cinzel", fontSize: 14 },

  eventCard: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  eventImage: { width: 70, height: 70, borderRadius: 8, marginRight: 10 },
  eventInfo: { flex: 1, justifyContent: "center", marginLeft: 10 },
  eventName: {
    fontFamily: "Cormorant",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eventDate: { fontFamily: "Cormorant", fontSize: 14 },

  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  posterHint: {
    fontFamily: "Cormorant",
    fontSize: 12,
    flexShrink: 1,
    paddingRight: 8,
  },
  detailsBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  detailsBtnText: {
    color: "#fff",
    fontFamily: "Cinzel",
    fontSize: 12,
    letterSpacing: 0.2,
  },

  noEventText: { fontFamily: "Cormorant", fontSize: 14, marginTop: 8 },

  badgeBox: {
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  badgeBoxText: { fontFamily: "Cormorant", fontSize: 14, marginBottom: 8 },
  badgeLink: {
    fontFamily: "Cormorant",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  reportBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reportText: { fontFamily: "Cormorant", fontSize: 14 },
  reportBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  reportBtnText: { color: "#fff", fontFamily: "Cinzel", fontSize: 12 },
});

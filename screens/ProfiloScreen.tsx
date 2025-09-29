import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Navbar from "../components/Navbar";
import {
  Share2,
  ImageIcon,
  Bell,
  Settings,
  Megaphone,
  Compass,
  Pencil,
  Camera as CamIcon,
  ImagePlus,
  Trash2,
} from "lucide-react-native";

import { useColors } from "../src/theme/ThemeContext";
import { RootStackParamList } from "../navigation/Navigation";
import { getSavedBorghi } from "../utils/borghiStorage";
import { Star, Map } from "lucide-react-native";

type ProfileNav = NativeStackNavigationProp<RootStackParamList, "Profilo">;

const AVATAR_DIR = FileSystem.documentDirectory + "profile/";
const AVATAR_PATH = AVATAR_DIR + "avatar.jpg";
const AVATAR_STORE_PATH = "profileAvatarPath";
const AVATAR_STORE_VER = "profileAvatarVer";

export default function ProfiloScreen() {
  const colors = useColors();
  const nav = useNavigation<ProfileNav>();
  const insets = useSafeAreaInsets();
  const TOP_PAD = Math.max(insets.top, 16) + 32;

  const [username, setUsername] = useState("Utente");
  const [stats, setStats] = useState({ borghi: 0, selfie: 0, eventi: 0 });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarVer, setAvatarVer] = useState<number>(1); // per cache-busting

  useEffect(() => {
    (async () => {
      const u = await SecureStore.getItemAsync("username");
      if (u) setUsername(u);

      const bStr = await SecureStore.getItemAsync("badges");
      if (bStr) {
        const j = JSON.parse(bStr);
        setStats({
          borghi: j.borghiVisitati || 0,
          selfie: j.selfie_fatti || 0,
          eventi: j.eventi_visitati || 0,
        });
      }

      // carica avatar persistito
      const savedPath = await SecureStore.getItemAsync(AVATAR_STORE_PATH);
      const savedVerStr = await SecureStore.getItemAsync(AVATAR_STORE_VER);
      if (savedVerStr) setAvatarVer(parseInt(savedVerStr, 10) || 1);
      if (savedPath) {
        const info = await FileSystem.getInfoAsync(savedPath);
        if (info.exists) setAvatarPath(savedPath);
        else {
          await SecureStore.deleteItemAsync(AVATAR_STORE_PATH);
        }
      }
    })();
  }, []);

  const displayUri = avatarPath ? `${avatarPath}?v=${avatarVer}` : null;

  /* ---------------- avatar handlers ---------------- */
  const ensurePermsMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };
  const ensurePermsCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };
  const ensureAvatarDir = async () => {
    const info = await FileSystem.getInfoAsync(AVATAR_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
    }
  };

  const saveAvatarFromUri = async (uri: string) => {
    await ensureAvatarDir();
    // sovrascrivo sempre lo stesso path; incremento versione per “bucare” la cache
    try {
      await FileSystem.deleteAsync(AVATAR_PATH, { idempotent: true });
    } catch {}
    await FileSystem.copyAsync({ from: uri, to: AVATAR_PATH });
    await SecureStore.setItemAsync(AVATAR_STORE_PATH, AVATAR_PATH);
    const newVer = Date.now();
    await SecureStore.setItemAsync(AVATAR_STORE_VER, String(newVer));
    setAvatarPath(AVATAR_PATH);
    setAvatarVer(newVer);
  };

  const pickFromLibrary = async () => {
    const ok = await ensurePermsMedia();
    if (!ok)
      return Alert.alert(
        "Permesso negato",
        "Consenti accesso alla galleria per cambiare avatar."
      );
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // quadrato
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.length) {
      await saveAvatarFromUri(res.assets[0].uri);
    }
  };

  const captureWithCamera = async () => {
    const ok = await ensurePermsCamera();
    if (!ok)
      return Alert.alert(
        "Permesso negato",
        "Consenti uso della fotocamera per scattare l'avatar."
      );
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.length) {
      await saveAvatarFromUri(res.assets[0].uri);
    }
  };

  const removeAvatar = async () => {
    try {
      await FileSystem.deleteAsync(AVATAR_PATH, { idempotent: true });
    } catch {}
    await SecureStore.deleteItemAsync(AVATAR_STORE_PATH);
    await SecureStore.deleteItemAsync(AVATAR_STORE_VER);
    setAvatarPath(null);
    setAvatarVer(1);
  };

  const openAvatarMenu = () => {
    Alert.alert(
      "Immagine profilo",
      "Scegli un'azione",
      [
        { text: "Carica da galleria", onPress: pickFromLibrary },
        { text: "Scatta foto", onPress: captureWithCamera },
        avatarPath
          ? { text: "Rimuovi", style: "destructive", onPress: removeAvatar }
          : undefined,
        { text: "Annulla", style: "cancel" },
      ].filter(Boolean) as any
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: TOP_PAD,
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <View style={{ alignItems: "center" }}>
          <View>
            {displayUri ? (
              <Image source={{ uri: displayUri }} style={styles.avatar} />
            ) : (
              <Image
                source={require("../assets/images/avatar_placeholder.png")}
                style={styles.avatar}
              />
            )}
            {/* pulsante modifica sopra l'avatar */}
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: colors.tint }]}
              onPress={openAvatarMenu}
            >
              <Pencil size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {username}
          </Text>
          <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
            Borgo Lover
          </Text>

          {/* scorciatoie avatar (opzionali) */}
          <View style={styles.quickEditRow}>
            <TouchableOpacity
              onPress={pickFromLibrary}
              style={[styles.quickChip, { backgroundColor: colors.card }]}
            >
              <ImagePlus size={14} color={colors.text} />
              <Text style={[styles.quickChipText, { color: colors.text }]}>
                Galleria
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={captureWithCamera}
              style={[styles.quickChip, { backgroundColor: colors.card }]}
            >
              <CamIcon size={14} color={colors.text} />
              <Text style={[styles.quickChipText, { color: colors.text }]}>
                Scatta
              </Text>
            </TouchableOpacity>
            {avatarPath && (
              <TouchableOpacity
                onPress={removeAvatar}
                style={[styles.quickChip, { backgroundColor: colors.card }]}
              >
                <Trash2 size={14} color="#cc4b4b" />
                <Text style={[styles.quickChipText, { color: "#cc4b4b" }]}>
                  Rimuovi
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsWrap, { backgroundColor: colors.card }]}>
          <Stat label="Borghi" value={stats.borghi} colors={colors} />
          <Stat label="Selfie" value={stats.selfie} colors={colors} />
          <Stat label="Eventi" value={stats.eventi} colors={colors} />
        </View>

        {/* Collegamenti rapidi (grandi) */}
        <View style={styles.quickGrid}>
          <QuickBtn
            title="Invita un amico"
            icon={<Share2 size={18} color="#fff" />}
            onPress={() => nav.navigate("InvitaAmico")}
            colors={colors}
          />
          <QuickBtn
            title="La mia galleria"
            icon={<ImageIcon size={18} color="#fff" />}
            onPress={() => nav.navigate("Galleria")}
            colors={colors}
          />
        </View>
        {/* Borghi salvati e visitati */}
        <View style={{ marginTop: 30 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            I tuoi borghi
          </Text>

          <TouchableOpacity
            onPress={() => nav.navigate("BorghiSalvati")}
            style={[styles.row, { backgroundColor: colors.card }]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={{ fontSize: 18 }}>🔖</Text>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                Salvati per dopo
              </Text>
            </View>
            <Text style={{ color: colors.sub }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.navigate("BorghiVisitati")}
            style={[styles.row, { backgroundColor: colors.card }]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={{ fontSize: 18 }}>📍</Text>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                Già visitati
              </Text>
            </View>
            <Text style={{ color: colors.sub }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Lista collegamenti (row) */}
        <LinkRow
          icon={<Bell size={18} color={colors.text} />}
          label="Notifiche"
          onPress={() => nav.navigate("Notifiche")}
          colors={colors}
        />
        <LinkRow
          icon={<Settings size={18} color={colors.text} />}
          label="Impostazioni"
          onPress={() => nav.navigate("SettingsScreen")}
          colors={colors}
        />
        <LinkRow
          icon={<Megaphone size={18} color={colors.text} />}
          label="Segnala un evento"
          onPress={() => nav.navigate("SegnalaEvento")}
          colors={colors}
        />
        <LinkRow
          icon={<Compass size={18} color={colors.text} />}
          label="Esplora"
          onPress={() => nav.navigate("Explore")}
          colors={colors}
        />
        <LinkRow
          icon={<Star size={18} color={colors.text} />}
          label="Borghi salvati"
          onPress={() => nav.navigate("BorghiSalvati")}
          colors={colors}
        />
        <LinkRow
          icon={<Map size={18} color={colors.text} />}
          label="Borghi visitati"
          onPress={() => nav.navigate("BorghiVisitati")}
          colors={colors}
        />
      </ScrollView>
      <Navbar />
    </SafeAreaView>
  );
}

/* ------- componentini ------- */
function Stat({
  label,
  value,
  colors,
}: {
  label: string;
  value: number;
  colors: any;
}) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ fontFamily: "Cinzel", fontSize: 18, color: colors.text }}>
        {value}
      </Text>
      <Text
        style={{ fontFamily: "Cormorant", fontSize: 12, color: colors.sub }}
      >
        {label}
      </Text>
    </View>
  );
}

function QuickBtn({
  title,
  icon,
  onPress,
  colors,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.quickBtn, { backgroundColor: colors.tint }]}
    >
      {icon}
      <Text style={styles.quickText}>{title}</Text>
    </TouchableOpacity>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.card }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {icon}
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={{ color: colors.sub }}>›</Text>
    </TouchableOpacity>
  );
}

/* ------- styles ------- */
const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginBottom: 10,
  },
  editBtn: {
    position: "absolute",
    right: -2,
    bottom: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  name: { fontFamily: "Cinzel", fontSize: 20, marginBottom: 2 },

  quickEditRow: { flexDirection: "row", gap: 8, marginTop: 4, marginBottom: 6 },
  quickChip: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickChipText: { fontFamily: "Cinzel", fontSize: 12 },

  statsWrap: {
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginTop: 14,
    gap: 10,
  },
  quickGrid: { flexDirection: "row", gap: 10, marginTop: 16 },
  quickBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickText: { color: "#fff", fontFamily: "Cinzel", fontSize: 12 },

  row: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
  },
  rowLabel: { fontFamily: "Cormorant", fontSize: 16 },
  sectionTitle: {
    fontFamily: "Cinzel",
    fontSize: 18,
    marginBottom: 12,
  },
});

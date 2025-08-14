import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, ImagePlus, Camera, Trash2 } from "lucide-react-native";
import { useColors } from "../src/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

type Picked = {
  uri: string;
  mime: string; // e.g. "image/jpeg"
  name: string; // e.g. "poster.jpg"
};

export default function SegnalaEventoScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const TOP_PAD = Math.max(insets.top, 16) + 32;

  const [titolo, setTitolo] = useState("");
  const [luogo, setLuogo] = useState("");
  const [dateRange, setDateRange] = useState(""); // es. 16/08/2025 - 18/08/2025
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");

  const [poster, setPoster] = useState<Picked | null>(null);

  /* ---------- picker helpers ---------- */
  const askMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };
  const askCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const pickFromLibrary = async () => {
    const ok = await askMediaPermission();
    if (!ok) {
      Alert.alert(
        "Permesso negato",
        "Concedi l’accesso alla galleria per caricare una locandina."
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      exif: false,
    });
    if (!res.canceled && res.assets?.length) {
      const a = res.assets[0];
      const ext = (a.fileName?.split(".").pop() || "jpg").toLowerCase();
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      setPoster({ uri: a.uri, mime, name: `poster.${ext}` });
    }
  };

  const captureWithCamera = async () => {
    const ok = await askCameraPermission();
    if (!ok) {
      Alert.alert(
        "Permesso negato",
        "Concedi l’uso della fotocamera per scattare la locandina."
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.length) {
      const a = res.assets[0];
      setPoster({ uri: a.uri, mime: "image/jpeg", name: "poster.jpg" });
    }
  };

  /* ---------- submit ---------- */
  const submit = async () => {
    if (!titolo.trim() || !luogo.trim()) {
      Alert.alert("Completa i campi", "Titolo e Luogo sono obbligatori.");
      return;
    }

    // Esempio invio multipart (se hai un endpoint REST):
    // const form = new FormData();
    // form.append("titolo", titolo);
    // form.append("luogo", luogo);
    // form.append("date", dateRange);
    // form.append("link", link);
    // form.append("note", note);
    // if (poster) {
    //   form.append("poster", {
    //     uri: poster.uri,
    //     name: poster.name,
    //     type: poster.mime,
    //   } as any);
    // }
    // await fetch("https://tuo-backend/api/segnala-evento", {
    //   method: "POST",
    //   headers: { "Content-Type": "multipart/form-data" },
    //   body: form,
    // });

    Alert.alert("Grazie!", "La tua segnalazione è stata inviata.");
    setTitolo("");
    setLuogo("");
    setDateRange("");
    setLink("");
    setNote("");
    setPoster(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: TOP_PAD,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Segnala un evento
          </Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Form */}
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="Titolo evento *"
          placeholderTextColor={colors.sub}
          value={titolo}
          onChangeText={setTitolo}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="Luogo * (città/borgo, provincia)"
          placeholderTextColor={colors.sub}
          value={luogo}
          onChangeText={setLuogo}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="Date (es. 16/08/2025 o 16/08/2025 - 18/08/2025)"
          placeholderTextColor={colors.sub}
          value={dateRange}
          onChangeText={setDateRange}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="Link ufficiale (facoltativo)"
          placeholderTextColor={colors.sub}
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              height: 110,
              textAlignVertical: "top",
            },
          ]}
          placeholder="Note / descrizione (facoltative)"
          placeholderTextColor={colors.sub}
          value={note}
          onChangeText={setNote}
          multiline
        />

        {/* Locandina: azioni */}
        <View style={styles.posterRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.card }]}
            onPress={pickFromLibrary}
          >
            <ImagePlus size={18} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Carica locandina
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.card }]}
            onPress={captureWithCamera}
          >
            <Camera size={18} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Scatta foto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Locandina: anteprima */}
        {poster && (
          <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
            <Image source={{ uri: poster.uri }} style={styles.previewImg} />
            <View style={styles.previewRight}>
              <Text
                style={[styles.previewName, { color: colors.text }]}
                numberOfLines={1}
              >
                {poster.name}
              </Text>
              <Text
                style={{
                  color: colors.sub,
                  fontFamily: "Cormorant",
                  fontSize: 12,
                }}
              >
                {poster.mime}
              </Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.smallBtn, { borderColor: colors.tint }]}
                  onPress={pickFromLibrary}
                >
                  <Text style={[styles.smallBtnText, { color: colors.tint }]}>
                    Sostituisci
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallBtn, { borderColor: "#cc4b4b" }]}
                  onPress={() => setPoster(null)}
                >
                  <Trash2 size={14} color="#cc4b4b" />
                  <Text
                    style={[
                      styles.smallBtnText,
                      { color: "#cc4b4b", marginLeft: 6 },
                    ]}
                  >
                    Rimuovi
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.tint }]}
          onPress={submit}
        >
          <Text style={styles.btnText}>INVIA</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backBtn: { padding: 8 },
  title: { flex: 1, textAlign: "center", fontFamily: "Cinzel", fontSize: 20 },

  input: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontFamily: "Cormorant",
    fontSize: 14,
  },

  posterRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: { fontFamily: "Cinzel", fontSize: 10 },

  previewCard: {
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    elevation: 1,
  },
  previewImg: { width: 72, height: 72, borderRadius: 8 },
  previewRight: { flex: 1, marginLeft: 12 },
  previewName: { fontFamily: "Cinzel", fontSize: 14 },

  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  smallBtnText: { fontFamily: "Cinzel", fontSize: 12 },

  btn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontFamily: "Cinzel", fontSize: 14 },
});

import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  AtSign,
  Link,
} from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { useColors } from "../src/theme/ThemeContext";

type Extra = {
  bio?: string;
  city?: string;
  instagram?: string;
  website?: string;
};

export default function EditProfiloScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const TOP_PAD = Math.max(insets.top, 16) + 32;

  const [username, setUsername] = useState("");
  const [extra, setExtra] = useState<Extra>({});

  useEffect(() => {
    (async () => {
      const u = await SecureStore.getItemAsync("username");
      if (u) setUsername(u);
      const e = await SecureStore.getItemAsync("profile.extra");
      if (e) setExtra(JSON.parse(e));
    })();
  }, []);

  const save = async () => {
    if (!username.trim())
      return Alert.alert("Attenzione", "Lo username non può essere vuoto.");
    await SecureStore.setItemAsync("username", username.trim());
    await SecureStore.setItemAsync("profile.extra", JSON.stringify(extra));
    Alert.alert("Salvato", "Profilo aggiornato.");
    nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: TOP_PAD,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Modifica profilo
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <Label
          icon={<User size={14} color={colors.sub} />}
          text="Username"
          colors={colors}
        />
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="Il tuo nome visibile"
          placeholderTextColor={colors.sub}
        />

        <Label text="Bio" colors={colors} />
        <TextInput
          value={extra.bio || ""}
          onChangeText={(v) => setExtra({ ...extra, bio: v })}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              height: 100,
              textAlignVertical: "top",
            },
          ]}
          placeholder="Racconta qualcosa…"
          placeholderTextColor={colors.sub}
          multiline
        />

        <Label
          icon={<MapPin size={14} color={colors.sub} />}
          text="Città"
          colors={colors}
        />
        <TextInput
          value={extra.city || ""}
          onChangeText={(v) => setExtra({ ...extra, city: v })}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="Es. La Spezia"
          placeholderTextColor={colors.sub}
        />

        <Label
          icon={<AtSign size={14} color={colors.sub} />}
          text="Instagram"
          colors={colors}
        />
        <TextInput
          value={extra.instagram || ""}
          onChangeText={(v) => setExtra({ ...extra, instagram: v })}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="@tuo_handle"
          placeholderTextColor={colors.sub}
          autoCapitalize="none"
        />

        <Label
          icon={<Link size={14} color={colors.sub} />}
          text="Sito web"
          colors={colors}
        />
        <TextInput
          value={extra.website || ""}
          onChangeText={(v) => setExtra({ ...extra, website: v })}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.text },
          ]}
          placeholder="https://…"
          placeholderTextColor={colors.sub}
          autoCapitalize="none"
        />

        <TouchableOpacity
          onPress={save}
          style={[styles.saveBtn, { backgroundColor: colors.tint }]}
        >
          <Save size={16} color="#fff" />
          <Text style={styles.saveText}>Salva</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
function Label({
  icon,
  text,
  colors,
}: {
  icon?: React.ReactNode;
  text: string;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 14,
        marginBottom: 6,
      }}
    >
      {icon}
      <Text style={{ fontFamily: "Cinzel", fontSize: 12, color: colors.sub }}>
        {text.toUpperCase()}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, textAlign: "center", fontFamily: "Cinzel", fontSize: 20 },
  input: {
    borderRadius: 10,
    padding: 12,
    fontFamily: "Cormorant",
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  saveText: { color: "#fff", fontFamily: "Cinzel", fontSize: 14 },
});

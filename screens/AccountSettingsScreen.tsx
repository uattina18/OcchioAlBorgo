import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { useColors, useTopPad } from "../src/theme/ThemeContext";
import * as SecureStore from "expo-secure-store";

export default function AccountSettingsScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const topPad = useTopPad();

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const n = await SecureStore.getItemAsync("nome");
      const c = await SecureStore.getItemAsync("cognome");
      const e = await SecureStore.getItemAsync("email");

      if (n) setNome(n);
      if (c) setCognome(c);
      if (e) setEmail(e);
    })();
  }, []);

  const handleSave = async () => {
    await SecureStore.setItemAsync("nome", nome);
    await SecureStore.setItemAsync("cognome", cognome);
    await SecureStore.setItemAsync("email", email);
    Alert.alert("Salvato", "Le modifiche sono state salvate correttamente.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: topPad, paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Il mio account
          </Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Form */}
        <View style={{ marginTop: 20 }}>
          <Text style={[styles.label, { color: colors.text }]}>Nome</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.hr, color: colors.text },
            ]}
            value={nome}
            onChangeText={setNome}
          />

          <Text style={[styles.label, { color: colors.text }]}>Cognome</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.hr, color: colors.text },
            ]}
            value={cognome}
            onChangeText={setCognome}
          />

          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.hr, color: colors.text },
            ]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.tint }]}
          >
            <Text style={styles.saveText}>Salva</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontFamily: "Cinzel",
  },
  label: {
    fontFamily: "Cormorant",
    fontSize: 14,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: "Cormorant",
    fontSize: 16,
    marginTop: 4,
  },
  saveBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontFamily: "Cinzel",
    fontSize: 16,
  },
});

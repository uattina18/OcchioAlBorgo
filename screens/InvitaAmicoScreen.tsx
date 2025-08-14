import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from "react-native";
import { useColors } from "../src/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Gift, CheckCircle2 } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

const REF_LINK = "https://example.com/app";
const REF_CODE = "AMICIDIUATTINA";

type Invites = { sent: number; success: number };

export default function InvitaAmicoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const TOP_PAD = Math.max(insets.top, 16) + 32;
  const nav = useNavigation();
  const [invites, setInvites] = useState<Invites>({ sent: 0, success: 0 });

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync("invites");
      if (saved) setInvites(JSON.parse(saved));
    })();
  }, []);

  const share = async () => {
    await Share.share({
      message: `Scarica BorgoQuest! Codice ${REF_CODE} ${REF_LINK}`,
    });
    const updated = { ...invites, sent: invites.sent + 1 };
    setInvites(updated);
    await SecureStore.setItemAsync("invites", JSON.stringify(updated));
  };

  const markSuccess = async () => {
    const updated = { ...invites, success: invites.success + 1 };
    setInvites(updated);
    await SecureStore.setItemAsync("invites", JSON.stringify(updated));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: TOP_PAD,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity onPress={() => nav.goBack()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "Cinzel",
              fontSize: 20,
              color: colors.text,
            }}
          >
            Invita un amico
          </Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Gift size={22} color={colors.text} />
          <Text style={[styles.text, { color: colors.text }]}>
            Condividi il tuo codice e ottieni badge quando un amico si registra!
          </Text>
          <View style={[styles.code, { borderColor: colors.hr }]}>
            <Text
              style={{ fontFamily: "Cinzel", fontSize: 16, color: colors.text }}
            >
              {REF_CODE}
            </Text>
          </View>

          <TouchableOpacity
            onPress={share}
            style={[styles.btn, { backgroundColor: colors.tint }]}
          >
            <Text style={{ color: "#fff", fontFamily: "Cinzel" }}>
              Condividi invito
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={markSuccess}
            style={[styles.btnGhost, { borderColor: colors.tint }]}
          >
            <CheckCircle2 size={16} color={colors.tint} />
            <Text
              style={{
                color: colors.tint,
                fontFamily: "Cinzel",
                marginLeft: 6,
              }}
            >
              Segna invito riuscito
            </Text>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
              Inviati: {invites.sent}
            </Text>
            <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
              A buon fine: {invites.success}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, gap: 12 },
  text: { fontFamily: "Cormorant", fontSize: 14 },
  code: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  btn: {
    marginTop: 6,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnGhost: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  statsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

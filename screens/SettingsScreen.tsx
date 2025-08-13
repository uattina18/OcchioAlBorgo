import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  User,
  Bell,
  Moon,
  Globe,
  ChevronRight,
} from "lucide-react-native";
import { useTheme, useColors } from "../src/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, setDark } = useTheme();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const TOP_PAD = Math.max(insets.top, 16) + 32; // ↓ spingi più in basso
  const dark = theme === "dark";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: TOP_PAD,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            IMPOSTAZIONI
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Lista */}
        <View style={{ marginTop: 8 }}>
          <Row
            icon={<User size={18} color={colors.text} />}
            label="Account"
            right={<ChevronRight size={18} color={colors.sub} />}
            onPress={() => {
              /* @ts-ignore */ navigation.navigate("Profilo");
            }}
            colors={colors}
          />
          <Row
            icon={<Bell size={18} color={colors.text} />}
            label="Notifiche"
            right={<ChevronRight size={18} color={colors.sub} />}
            onPress={() => {
              /* @ts-ignore */ navigation.navigate("Notifiche");
            }}
            colors={colors}
          />
          <Row
            icon={<Moon size={18} color={colors.text} />}
            label="Tema scuro"
            right={
              <Switch
                value={dark}
                onValueChange={(v) => setDark(v)}
                thumbColor={"#fff"}
                trackColor={{ false: "#cfcfcf", true: colors.tint }}
              />
            }
            colors={colors}
            pressable={false}
          />
          <Row
            icon={<Globe size={18} color={colors.text} />}
            label="Lingua"
            right={<ChevronRight size={18} color={colors.sub} />}
            onPress={() => {}}
            colors={colors}
          />

          <View style={[styles.hr, { backgroundColor: colors.hr }]} />
          <TouchableOpacity onPress={() => {}} style={styles.logoutBtn}>
            <Text style={[styles.logoutText, { color: colors.text }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  right,
  onPress,
  colors,
  pressable = true,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  colors: { card: string; text: string; sub: string; hr: string; tint: string };
  pressable?: boolean;
}) {
  const Comp: any = pressable ? TouchableOpacity : View;
  return (
    <Comp
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.card }]}
    >
      <View style={styles.rowLeft}>
        {icon}
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>{right}</View>
    </Comp>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Cinzel",
    fontSize: 20,
    letterSpacing: 0.5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowLabel: { fontFamily: "Cormorant", fontSize: 16 },
  rowRight: { marginLeft: "auto" },

  hr: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
  logoutBtn: { paddingVertical: 14, paddingHorizontal: 6 },
  logoutText: { fontFamily: "Cormorant", fontSize: 16 },
});

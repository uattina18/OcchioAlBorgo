import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { useColors } from "../src/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThumbsUp,
  ArrowLeft,
  Images,
  Upload,
  Filter,
} from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

type CommunityPhoto = { id: string; uri: string; author: string; ts: number };
type VoteState = { liked: boolean; score: number }; // 👈 solo like
type MyPhoto = { id: string; uri: string; ts: number; votesUp?: number }; // 👈 solo likes

const COMMUNITY_SEED: CommunityPhoto[] = [
  {
    id: "c1",
    uri: "https://picsum.photos/id/1011/900/900",
    author: "Giulia",
    ts: Date.now() - 86400000 * 1,
  },
  {
    id: "c2",
    uri: "https://picsum.photos/id/1012/900/900",
    author: "Luca",
    ts: Date.now() - 86400000 * 2,
  },
  {
    id: "c3",
    uri: "https://picsum.photos/id/1013/900/900",
    author: "Sara",
    ts: Date.now() - 86400000 * 3,
  },
  {
    id: "c4",
    uri: "https://picsum.photos/id/1015/900/900",
    author: "Marco",
    ts: Date.now() - 86400000 * 5,
  },
];

export default function GalleriaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const TOP_PAD = Math.max(insets.top, 16) + 32;
  const nav = useNavigation();

  const [tab, setTab] = useState<"community" | "mine">("community");

  // COMMUNITY
  const [votes, setVotes] = useState<Record<string, VoteState>>({});
  const [sort, setSort] = useState<"recent" | "top">("recent");

  // migrazione vecchio formato { myVote, score } -> { liked, score }
  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync("communityVotes");
      if (!raw) return;
      try {
        const obj = JSON.parse(raw);
        const entries = Object.entries(obj);
        // se è già nel nuovo formato, salvo e basta
        const migrated: Record<string, VoteState> = {};
        for (const [id, st] of entries as any) {
          if ("liked" in st) {
            migrated[id] = { liked: !!st.liked, score: Number(st.score || 0) };
          } else {
            const liked = st.myVote === 1;
            const score = Math.max(0, Number(st.score ?? (liked ? 1 : 0)));
            migrated[id] = { liked, score };
          }
        }
        setVotes(migrated);
        await SecureStore.setItemAsync(
          "communityVotes",
          JSON.stringify(migrated)
        );
      } catch {
        // se parsing fallisce, azzero
        setVotes({});
        await SecureStore.setItemAsync("communityVotes", JSON.stringify({}));
      }
    })();
  }, []);

  const [community, setCommunity] = useState<CommunityPhoto[]>(COMMUNITY_SEED);
  useEffect(() => {
    (async () => {
      const seeded = await SecureStore.getItemAsync("communityPhotos");
      if (!seeded)
        await SecureStore.setItemAsync(
          "communityPhotos",
          JSON.stringify(COMMUNITY_SEED)
        );
      const list = await SecureStore.getItemAsync("communityPhotos");
      if (list) setCommunity(JSON.parse(list));
    })();
  }, []);

  const communitySorted = useMemo(() => {
    const arr = [...community];
    if (sort === "top")
      arr.sort((a, b) => (votes[b.id]?.score || 0) - (votes[a.id]?.score || 0));
    else arr.sort((a, b) => b.ts - a.ts);
    return arr;
  }, [community, sort, votes]);

  const toggleLike = async (id: string) => {
    const prev = votes[id]?.liked || false;
    const base = votes[id]?.score || 0;
    const liked = !prev;
    const score = base + (liked ? 1 : -1);
    const next = { ...votes, [id]: { liked, score: Math.max(0, score) } };
    setVotes(next);
    await SecureStore.setItemAsync("communityVotes", JSON.stringify(next));
  };

  // LE MIE
  const [mine, setMine] = useState<MyPhoto[]>([]);
  const [mineFilter, setMineFilter] = useState<"all" | "voted" | "not">("all");
  useEffect(() => {
    (async () => {
      const mp = await SecureStore.getItemAsync("myPhotos");
      if (mp) setMine(JSON.parse(mp));
    })();
  }, []);
  const saveMine = async (arr: MyPhoto[]) => {
    setMine(arr);
    await SecureStore.setItemAsync("myPhotos", JSON.stringify(arr));
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permesso negato", "Concedi l’accesso alla galleria.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled && res.assets?.length) {
      const a = res.assets[0];
      await saveMine([
        { id: "m" + Date.now(), uri: a.uri, ts: Date.now(), votesUp: 0 },
        ...mine,
      ]);
    }
  };
  const captureWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permesso negato", "Concedi l’uso della fotocamera.");
    const res = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!res.canceled && res.assets?.length) {
      const a = res.assets[0];
      await saveMine([
        { id: "m" + Date.now(), uri: a.uri, ts: Date.now(), votesUp: 0 },
        ...mine,
      ]);
    }
  };

  const mineFiltered = useMemo(() => {
    return mine.filter((p) => {
      const hasLikes = (p.votesUp || 0) > 0;
      if (mineFilter === "voted") return hasLikes;
      if (mineFilter === "not") return !hasLikes;
      return true;
    });
  }, [mine, mineFilter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: TOP_PAD,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.back}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Galleria</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setTab("community")}
            style={[
              styles.tab,
              {
                backgroundColor:
                  tab === "community" ? colors.tint : colors.card,
              },
            ]}
          >
            <Images
              size={16}
              color={tab === "community" ? "#fff" : colors.text}
            />
            <Text
              style={[
                styles.tabText,
                { color: tab === "community" ? "#fff" : colors.text },
              ]}
            >
              Community
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("mine")}
            style={[
              styles.tab,
              { backgroundColor: tab === "mine" ? colors.tint : colors.card },
            ]}
          >
            <Upload size={16} color={tab === "mine" ? "#fff" : colors.text} />
            <Text
              style={[
                styles.tabText,
                { color: tab === "mine" ? "#fff" : colors.text },
              ]}
            >
              Le mie
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "community" ? (
          <>
            {/* ordina */}
            <View style={styles.sortRow}>
              <Filter size={16} color={colors.sub} />
              <Text
                style={{
                  color: colors.sub,
                  fontFamily: "Cormorant",
                  marginLeft: 6,
                }}
              >
                Ordina:
              </Text>
              <TouchableOpacity
                onPress={() => setSort("recent")}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      sort === "recent" ? colors.tint : colors.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: sort === "recent" ? "#fff" : colors.text },
                  ]}
                >
                  Recenti
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSort("top")}
                style={[
                  styles.chip,
                  {
                    backgroundColor: sort === "top" ? colors.tint : colors.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: sort === "top" ? "#fff" : colors.text },
                  ]}
                >
                  Più piaciute
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={communitySorted}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => {
                const v = votes[item.id]?.liked || false;
                const score = votes[item.id]?.score || 0;
                return (
                  <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Image source={{ uri: item.uri }} style={styles.img} />
                    <View style={styles.cardFooter}>
                      <Text style={[styles.author, { color: colors.text }]}>
                        {item.author}
                      </Text>
                      <View style={styles.likeRow}>
                        <TouchableOpacity
                          style={[
                            styles.likeBtn,
                            v && { backgroundColor: colors.tint },
                          ]}
                          onPress={() => toggleLike(item.id)}
                        >
                          <ThumbsUp
                            size={16}
                            color={v ? "#fff" : colors.text}
                          />
                        </TouchableOpacity>
                        <Text style={[styles.score, { color: colors.sub }]}>
                          {score}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </>
        ) : (
          <>
            {/* azioni */}
            <View style={styles.mineActions}>
              <TouchableOpacity
                onPress={pickFromLibrary}
                style={[styles.actionBtn, { backgroundColor: colors.card }]}
              >
                <Text style={{ fontFamily: "Cinzel", color: colors.text }}>
                  Carica foto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={captureWithCamera}
                style={[styles.actionBtn, { backgroundColor: colors.card }]}
              >
                <Text style={{ fontFamily: "Cinzel", color: colors.text }}>
                  Scatta
                </Text>
              </TouchableOpacity>
            </View>

            {/* filtri */}
            <View style={styles.filterRow}>
              <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
                Mostra:
              </Text>
              {(["all", "voted", "not"] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setMineFilter(f)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        mineFilter === f ? colors.tint : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: mineFilter === f ? "#fff" : colors.text },
                    ]}
                  >
                    {f === "all"
                      ? "Tutte"
                      : f === "voted"
                      ? "Con like"
                      : "Senza like"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FlatList
              data={mineFiltered}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                  <Image source={{ uri: item.uri }} style={styles.img} />
                  <View style={styles.mineFooter}>
                    <Text
                      style={{ color: colors.sub, fontFamily: "Cormorant" }}
                    >
                      👍 {item.votesUp || 0}
                    </Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center" },
  back: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { flex: 1, textAlign: "center", fontFamily: "Cinzel", fontSize: 20 },

  tabs: { flexDirection: "row", gap: 8, marginTop: 12 },
  tab: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  tabText: { fontFamily: "Cinzel", fontSize: 13 },

  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  chip: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { fontFamily: "Cinzel", fontSize: 12 },

  card: { borderRadius: 12, overflow: "hidden", marginTop: 12, elevation: 1 },
  img: { width: "100%", height: 240 },
  cardFooter: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  author: { fontFamily: "Cinzel", fontSize: 14 },

  likeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  likeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  score: { fontFamily: "Cinzel", fontSize: 14 },

  mineActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  mineFooter: { padding: 10, alignItems: "flex-end" },
});

// screens/NotificheScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Bell,
  CheckCircle2,
  UserPlus,
  Heart,
  MessageSquare,
  Award,
  Trash2,
  ArrowLeft,
} from "lucide-react-native";
import { useColors } from "../src/theme/ThemeContext";
import {
  AppNotification,
  getNotifications,
  subscribe,
  markRead,
  markAllRead,
  removeNotification,
  clearAll,
} from "../utils/notificationStore";

function formatWhen(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} g`;
}

export default function NotificheScreen() {
  const colors = useColors();
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // load + subscribe
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const data = await getNotifications();
      if (mounted) setItems(data);
    };
    load();

    const unsub = subscribe(() => {
      // ricarica alla modifica dello store
      load();
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getNotifications();
      setItems(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const onPressItem = useCallback(async (n: AppNotification) => {
    if (!n.read) await markRead(n.id, true);
    // opzionale: navigazioni in base al tipo
    // es. if (n.type === "badge_unlocked") nav.navigate("Badges");
  }, []);

  const onDeleteItem = useCallback(async (id: string) => {
    await removeNotification(id);
  }, []);

  const onMarkAllRead = useCallback(async () => {
    await markAllRead();
  }, []);

  const onClearAll = useCallback(() => {
    Alert.alert("Svuota notifiche", "Vuoi eliminare tutte le notifiche?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Svuota",
        style: "destructive",
        onPress: async () => {
          await clearAll();
        },
      },
    ]);
  }, []);

  const renderIcon = (type: AppNotification["type"]) => {
    const c = colors.tint;
    switch (type) {
      case "friend_request":
        return <UserPlus size={20} color={c} />;
      case "like":
        return <Heart size={20} color={c} />;
      case "comment":
        return <MessageSquare size={20} color={c} />;
      case "badge_unlocked":
        return <Award size={20} color={c} />;
      default:
        return <Bell size={20} color={c} />;
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      onPress={() => onPressItem(item)}
      onLongPress={() => onDeleteItem(item.id)}
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: item.read ? "transparent" : colors.tint,
        },
      ]}
    >
      <View style={styles.leftIcon}>{renderIcon(item.type)}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        {!!item.body && (
          <Text style={[styles.body, { color: colors.sub }]} numberOfLines={2}>
            {item.body}
          </Text>
        )}
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.when, { color: colors.sub }]}>
          {formatWhen(item.createdAt)}
        </Text>
        {!item.read && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.tint,
              alignSelf: "flex-end",
              marginTop: 6,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: Math.max(insets.top, 12),
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notifiche
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={onMarkAllRead} style={styles.headerBtn}>
            <CheckCircle2 size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClearAll} style={styles.headerBtn}>
            <Trash2 size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Bell size={28} color={colors.sub} />
            <Text style={{ color: colors.sub, marginTop: 8 }}>
              Nessuna notifica
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Cinzel",
    fontSize: 18,
  },
  row: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  leftIcon: { width: 28, alignItems: "center" },
  title: { fontFamily: "Cinzel", fontSize: 14 },
  body: { fontFamily: "Cormorant", fontSize: 13, marginTop: 2 },
  rightCol: { alignItems: "flex-end", marginLeft: 8 },
  when: { fontSize: 11, fontFamily: "Cormorant" },
});

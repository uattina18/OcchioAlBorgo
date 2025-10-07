// src/utils/notificationStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { popJustUnlocked } from "./badgesEngine";

const KEY = "notifications_v1";

export type NotificationType =
  | "friend_request"
  | "like"
  | "comment"
  | "badge_unlocked"
  | "system";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  createdAt: number;
  read: boolean;
  payload?: Record<string, any>;
};

// ── mini event-bus compatibile RN ──
type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange() {
  for (const l of Array.from(listeners)) {
    try {
      l();
    } catch {}
  }
}
export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ── storage ──
async function loadAll(): Promise<AppNotification[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as AppNotification[];
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    await AsyncStorage.removeItem(KEY);
    return [];
  }
}
async function saveAll(list: AppNotification[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  emitChange();
}

// ── API ──
export async function getNotifications() {
  return loadAll();
}

export async function addNotification(
  n: Omit<AppNotification, "id" | "createdAt" | "read"> & {
    id?: string;
    createdAt?: number;
    read?: boolean;
  }
) {
  const list = await loadAll();
  const full: AppNotification = {
    id: n.id ?? cryptoRandom(),
    createdAt: n.createdAt ?? Date.now(),
    read: n.read ?? false,
    ...n,
  };
  await saveAll([full, ...list]);
  return full.id;
}

export async function markRead(id: string, read = true) {
  const list = await loadAll();
  await saveAll(list.map((x) => (x.id === id ? { ...x, read } : x)));
}
export async function markAllRead() {
  const list = await loadAll();
  await saveAll(list.map((x) => ({ ...x, read: true })));
}
export async function removeNotification(id: string) {
  const list = await loadAll();
  await saveAll(list.filter((x) => x.id !== id));
}
export async function clearAll() {
  await saveAll([]);
}

// ── helpers dominio ──
export async function pushFriendRequest(fromUser: {
  id: string;
  name: string;
}) {
  return addNotification({
    type: "friend_request",
    title: "Nuova richiesta di amicizia",
    body: `${fromUser.name} vuole aggiungerti`,
    payload: { fromUser },
  });
}
export async function pushLike(
  photoId: string,
  fromUser: { id: string; name: string }
) {
  return addNotification({
    type: "like",
    title: "Hai ricevuto un like",
    body: `${fromUser.name} ha messo Mi piace alla tua foto`,
    payload: { photoId, fromUser },
  });
}
export async function pushBadgeUnlocked(badgeId: string, title: string) {
  return addNotification({
    type: "badge_unlocked",
    title: "Badge sbloccato 🎉",
    body: title,
    payload: { badgeId },
  });
}

/** Legge l’ultimo badge sbloccato dal badgesEngine e crea una notifica.
 * Ritorna l’id del badge o null.
 */
export async function notifyAllJustUnlocked(extra?: {
  regionId?: string;
  borgoId?: string;
  borgoName?: string;
}) {
  const id = await popJustUnlocked();
  if (!id) return null;
  await pushBadgeUnlocked(id, `Hai sbloccato: ${id}`);
  if (extra && (extra.regionId || extra.borgoId || extra.borgoName)) {
    await addNotification({
      type: "system",
      title: "Dettagli sblocco badge",
      body: extra.borgoName
        ? `Scatto a ${extra.borgoName}`
        : "Hai sbloccato un badge",
      payload: { ...extra, kind: "badge_context" },
    });
  }
  return id;
}

// ── id helper ──
function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

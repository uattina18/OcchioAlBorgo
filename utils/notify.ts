// src/utils/notify.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  addNotification,
  NotificationItem,
  NotificationType,
} from "../utils/notificationStore";
import { v4 as uuidv4 } from "uuid"; // se non l’hai: npm i uuid @types/uuid

export async function ensureNotificationPerms() {
  const s = await Notifications.getPermissionsAsync();
  if (!s.granted) await Notifications.requestPermissionsAsync();
}

export async function configureAndroidChannels() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("social", {
    name: "Social",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
  });
  await Notifications.setNotificationChannelAsync("default", {
    name: "Generale",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// invia notifica locale immediata + salva in store
export async function pushLocalAndStore(params: {
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, any>;
}) {
  const item: NotificationItem = {
    id: uuidv4(),
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data,
    read: false,
    createdAt: Date.now(),
  };

  await addNotification(item);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: { ...params.data, notifId: item.id, type: item.type },
      sound: true,
    },
    trigger: null, // subito
  });

  return item.id;
}

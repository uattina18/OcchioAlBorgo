// utils/scattiStore.ts
import * as FileSystem from "expo-file-system";
import * as Network from "expo-network";
import * as Battery from "expo-battery";

export type ScattoItem = {
  id: string;
  uri: string;
  borgoId: string;
  borgoName: string;
  lat: number;
  lng: number;
  heading: number;
  takenAt: string;
  status: "pending" | "done" | "failed";
  tries: number;
  lastError?: string;
};

type QueueFile = { items: ScattoItem[] };

const DIR = FileSystem.documentDirectory + "scatti/";
const QUEUE = FileSystem.documentDirectory + "scattiQueue.json";

function normalizeFileUri(u: string) {
  if (!u) return u;
  return u.startsWith("file://") ? u : `file://${u}`;
}
function safeExtFromUri(u: string) {
  try {
    const clean = u.split("?")[0].split("#")[0];
    const ext = clean.split(".").pop();
    return ext && ext.length <= 5 ? ext : "jpg";
  } catch {
    return "jpg";
  }
}

async function ensureSetup() {
  const dirInfo = await FileSystem.getInfoAsync(DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
  const qInfo = await FileSystem.getInfoAsync(QUEUE);
  if (!qInfo.exists) {
    await FileSystem.writeAsStringAsync(QUEUE, JSON.stringify({ items: [] }));
  } else {
    try {
      const raw = await FileSystem.readAsStringAsync(QUEUE);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        await FileSystem.writeAsStringAsync(
          QUEUE,
          JSON.stringify({ items: parsed })
        );
      }
    } catch {
      await FileSystem.writeAsStringAsync(QUEUE, JSON.stringify({ items: [] }));
    }
  }
}
async function readQueue(): Promise<QueueFile> {
  await ensureSetup();
  try {
    const raw = await FileSystem.readAsStringAsync(QUEUE);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { items: parsed };
    if (parsed && Array.isArray(parsed.items)) return { items: parsed.items };
    return { items: [] };
  } catch {
    return { items: [] };
  }
}
async function writeQueue(q: QueueFile) {
  await ensureSetup();
  await FileSystem.writeAsStringAsync(
    QUEUE,
    JSON.stringify({ items: q.items ?? [] })
  );
}

export async function saveScattoToQueue(params: {
  tempUri: string;
  borgoId: string;
  borgoName: string;
  lat: number;
  lng: number;
  heading: number;
}) {
  await ensureSetup();

  const id = String(Date.now());
  const ext = safeExtFromUri(params.tempUri);
  const finalUri = `${DIR}${id}.${ext}`;

  const src = normalizeFileUri(params.tempUri);
  const info = await FileSystem.getInfoAsync(src);
  if (!info.exists) {
    const altInfo = await FileSystem.getInfoAsync(params.tempUri);
    if (!altInfo.exists) throw new Error("SOURCE_MISSING");
  }

  try {
    await FileSystem.copyAsync({ from: src, to: finalUri });
  } catch {
    await FileSystem.moveAsync({ from: src, to: finalUri });
  }

  const q = await readQueue();
  q.items.push({
    id,
    uri: finalUri,
    borgoId: params.borgoId,
    borgoName: params.borgoName,
    lat: params.lat,
    lng: params.lng,
    heading: params.heading,
    takenAt: new Date().toISOString(),
    status: "pending",
    tries: 0,
  });
  await writeQueue(q);
  return id;
}

export async function listScatti(): Promise<ScattoItem[]> {
  return (await readQueue()).items
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function canProcessNow() {
  const net = await Network.getNetworkStateAsync();
  const onLine = !!(net.isConnected && net.isInternetReachable);
  const batt = await Battery.getBatteryLevelAsync().catch(() => 1);
  const low = await Battery.isLowPowerModeEnabledAsync().catch(() => false);
  return onLine && batt >= 0.15 && !low;
}

export async function processQueue(
  uploadFn: (item: ScattoItem) => Promise<void>
) {
  const q = await readQueue();
  let changed = false;
  for (const it of q.items) {
    if (it.status !== "pending") continue;
    if (it.tries >= 5) {
      it.status = "failed";
      changed = true;
      continue;
    }
    try {
      await uploadFn(it);
      it.status = "done";
      it.lastError = undefined;
      changed = true;
    } catch (e: any) {
      it.tries += 1;
      it.lastError = String(e?.message || e || "upload error");
      changed = true;
    }
  }
  if (changed) await writeQueue(q);
}

export async function mockUpload(_item: ScattoItem) {
  await new Promise((r) => setTimeout(r, 400));
}

export async function deleteScatto(id: string) {
  const q = await readQueue();
  const idx = q.items.findIndex((it) => it.id === id);
  if (idx >= 0) {
    const it = q.items[idx];
    try {
      await FileSystem.deleteAsync(it.uri, { idempotent: true });
    } catch {}
    q.items.splice(idx, 1);
    await writeQueue(q);
  }
}

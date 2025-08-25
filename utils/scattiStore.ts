// src/utils/scattiStore.ts
import * as FileSystem from "expo-file-system";
import * as Network from "expo-network";
import * as Battery from "expo-battery";

// ---- Tipi ----
export type ScattoItem = {
  id: string; // es. timestamp
  uri: string; // path locale definitivo (in /scatti)
  borgoId: string;
  borgoName: string;
  lat: number;
  lng: number;
  heading: number;
  takenAt: string; // ISO
  status: "pending" | "done" | "failed";
  tries: number;
  lastError?: string;
};

type QueueFile = { items: ScattoItem[] };

// ---- Percorsi ----
const DIR = FileSystem.documentDirectory + "scatti/";
const QUEUE = FileSystem.documentDirectory + "scattiQueue.json";

// ---- Helpers file ----
async function ensureSetup() {
  const dirInfo = await FileSystem.getInfoAsync(DIR);
  if (!dirInfo.exists)
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });

  const qInfo = await FileSystem.getInfoAsync(QUEUE);
  if (!qInfo.exists) {
    const init: QueueFile = { items: [] };
    await FileSystem.writeAsStringAsync(QUEUE, JSON.stringify(init));
  }
}
async function readQueue(): Promise<QueueFile> {
  await ensureSetup();
  const raw = await FileSystem.readAsStringAsync(QUEUE);
  try {
    return JSON.parse(raw) as QueueFile;
  } catch {
    return { items: [] };
  }
}
async function writeQueue(q: QueueFile) {
  await FileSystem.writeAsStringAsync(QUEUE, JSON.stringify(q));
}

// ---- API pubblica ----
/** Sposta la foto in una cartella permanente e inserisce l’item in coda (pending) */
export async function saveScattoToQueue(params: {
  tempUri: string; // uri restituito dalla camera
  borgoId: string;
  borgoName: string;
  lat: number;
  lng: number;
  heading: number;
}) {
  await ensureSetup();
  const id = String(Date.now());
  const ext = params.tempUri.split(".").pop() || "jpg";
  const finalUri = `${DIR}${id}.${ext}`;

  // sposta il file sotto /scatti
  try {
    await FileSystem.moveAsync({ from: params.tempUri, to: finalUri });
  } catch {
    // se move fallisce (es. cross-volume), copia e cancella
    await FileSystem.copyAsync({ from: params.tempUri, to: finalUri });
    try {
      await FileSystem.deleteAsync(params.tempUri, { idempotent: true });
    } catch {}
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

/** Ritorna tutti gli scatti (qualsiasi stato) */
export async function listScatti(): Promise<ScattoItem[]> {
  return (await readQueue()).items
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Condizioni per processare la coda: rete ok + batteria non critica */
export async function canProcessNow() {
  const net = await Network.getNetworkStateAsync();
  const onLine = !!net.isInternetReachable;
  const batt = await Battery.getBatteryLevelAsync().catch(() => 1);
  const lowPower = await Battery.isLowPowerModeEnabledAsync().catch(
    () => false
  );
  return onLine && batt >= 0.15 && !lowPower;
}

/**
 * Processa la coda: chiama uploadFn(item) sugli elementi pending.
 * Se upload va, marca "done"; se fallisce, incrementa tries e lascia pending/failed.
 * uploadFn: implementa qui la tua chiamata al backend. Deve lanciare errore su fail.
 */
export async function processQueue(
  uploadFn: (item: ScattoItem) => Promise<void>
) {
  const q = await readQueue();
  let changed = false;

  for (const it of q.items) {
    if (it.status !== "pending") continue;

    // opzionale: limita retry
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
      // non stop: continua con gli altri
    }
  }
  if (changed) await writeQueue(q);
}

/** Esempio di upload di test (finché non hai il backend): finge un upload */
export async function mockUpload(item: ScattoItem) {
  // qui metterai: upload multipart con FileSystem.uploadAsync(...) o fetch FormData
  await new Promise((r) => setTimeout(r, 400));
  // se vuoi simulare fail casuali:
  // if (Math.random() < 0.2) throw new Error("rete instabile");
}

export async function deleteScatto(id: string) {
  const raw = await FileSystem.readAsStringAsync(QUEUE);
  let q: QueueFile;
  try {
    q = JSON.parse(raw) as QueueFile;
  } catch {
    q = { items: [] };
  }

  const idx = q.items.findIndex((it) => it.id === id);
  if (idx >= 0) {
    const it = q.items[idx];
    try {
      await FileSystem.deleteAsync(it.uri, { idempotent: true });
    } catch (e) {
      console.warn("Errore deleteAsync", e);
    }
    q.items.splice(idx, 1);
    await FileSystem.writeAsStringAsync(QUEUE, JSON.stringify(q));
  }
}

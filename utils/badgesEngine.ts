// src/utils/badgesEngine.ts
import * as SecureStore from "expo-secure-store";
import defs from "../assets/data/badges.json";

/** Stato persistito */
type State = {
  // contatori generali
  borghiVisitati: number;
  fotoCaricate: number;
  schedeAperte: number;
  eventiPartecipati: number;

  // dimensioni regionali (dinamiche per regione corrente)
  // esempio: { liguria: 3, toscana: 1 }
  borghiVisitatiByRegion: Record<string, number>;

  // copertura province per regione: { liguria: { GE:true, IM:false, ... } }
  provinceCoperte: Record<string, Record<string, boolean>>;
  provinceTotali: Record<string, number>;

  // set badge sbloccati
  unlocked: Record<string, boolean>;

  // ultimo badge sbloccato (per “toast una volta”)
  justUnlocked: string | null;
};

const KEY = "badge_engine_state";

/** Carica stato */
export async function loadState(): Promise<State> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) {
    const empty: State = {
      borghiVisitati: 0,
      fotoCaricate: 0,
      schedeAperte: 0,
      eventiPartecipati: 0,
      borghiVisitatiByRegion: {},
      provinceCoperte: {},
      provinceTotali: {},
      unlocked: {},
      justUnlocked: null,
    };
    await SecureStore.setItemAsync(KEY, JSON.stringify(empty));
    return empty;
  }
  try {
    return JSON.parse(raw) as State;
  } catch {
    // fallback se corrotto
    await SecureStore.deleteItemAsync(KEY);
    return await loadState();
  }
}

/** Salva stato */
async function saveState(s: State) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(s));
}

/** Imposta quante province ha la regione corrente (chiamalo quando conosci la regione attiva) */
export async function setRegionProvinces(
  regionId: string,
  provinceCodes: string[]
) {
  const s = await loadState();
  s.provinceTotali[regionId] = provinceCodes.length;
  if (!s.provinceCoperte[regionId]) s.provinceCoperte[regionId] = {};
  // non azzeriamo coperture esistenti
  await saveState(s);
}

/** Marca una provincia come coperta (visitato almeno un borgo in quella provincia) */
export async function markProvinceCovered(
  regionId: string,
  provinceCode: string
) {
  const s = await loadState();
  if (!s.provinceCoperte[regionId]) s.provinceCoperte[regionId] = {};
  s.provinceCoperte[regionId][provinceCode] = true;
  await saveState(s);
}

/** Incrementi basilari */
export async function incBorghiVisitati(regionId?: string) {
  const s = await loadState();
  s.borghiVisitati++;
  if (regionId) {
    s.borghiVisitatiByRegion[regionId] =
      (s.borghiVisitatiByRegion[regionId] || 0) + 1;
  }
  await saveState(s);
  await evaluateAll(regionId);
}

export async function incFotoCaricate() {
  const s = await loadState();
  s.fotoCaricate++;
  await saveState(s);
  await evaluateAll();
}

export async function incSchedeAperte() {
  const s = await loadState();
  s.schedeAperte++;
  await saveState(s);
  await evaluateAll();
}

export async function incEventiPartecipati(regionId?: string) {
  const s = await loadState();
  s.eventiPartecipati++;
  await saveState(s);
  await evaluateAll(regionId);
}

/** Leggi e pulisci l’ultimo badge sbloccato (per mostrare un box/toast una sola volta) */
export async function popJustUnlocked(): Promise<string | null> {
  const s = await loadState();
  const id = s.justUnlocked;
  if (id) {
    s.justUnlocked = null;
    await saveState(s);
  }
  return id;
}

/** Badge sbloccati */
export async function getUnlocked(): Promise<Record<string, boolean>> {
  const s = await loadState();
  return s.unlocked;
}

/** Valuta tutte le definizioni e sblocca se le condizioni sono soddisfatte */
export async function evaluateAll(regionId?: string) {
  const s = await loadState();
  const region = regionId || (await getActiveRegionId()); // implementa come preferisci
  const list = (defs as any).badges as any[];

  for (const b of list) {
    if (s.unlocked[b.id]) continue; // già sbloccato

    const inScope =
      b.scope === "global" ||
      b.scope === "region" ||
      (typeof b.scope === "string" && b.scope.startsWith("region:"));

    if (!inScope) continue;

    // filtro per regione specifica, se serve
    if (typeof b.scope === "string" && b.scope.startsWith("region:")) {
      const target = b.scope.split(":")[1];
      if (region !== target) continue;
    }

    let ok = false;

    if (b.type === "threshold") {
      // metriche globali o regionali
      if (typeof b.metric === "string" && b.metric.includes(":")) {
        const [metricName, metricRegion] = b.metric.split(":");
        if (metricName === "borghiVisitati") {
          const count = s.borghiVisitatiByRegion[metricRegion] || 0;
          ok = count >= b.threshold;
        }
      } else {
        const val = (s as any)[b.metric] || 0;
        ok = val >= b.threshold;
      }
    }

    if (b.type === "coverage") {
      if (b.metric === "provinceCoperte" && b.coverageOf === "provinceTotali") {
        const tot = s.provinceTotali[region] || 0;
        const covered = s.provinceCoperte[region]
          ? Object.values(s.provinceCoperte[region]).filter(Boolean).length
          : 0;
        ok = tot > 0 && covered >= tot;
      }
    }

    if (ok) {
      s.unlocked[b.id] = true;
      s.justUnlocked = b.id; // per notifica one-shot
    }
  }

  await saveState(s);
}

/** Stub: decidi tu come sapere qual è la regione attiva (impostazioni utente, geolocalizzazione, scelta UI...) */
async function getActiveRegionId(): Promise<string> {
  // Esempio: leggi da SecureStore una preferenza dell’utente
  const r = await SecureStore.getItemAsync("active_region_id");
  return r || "liguria"; // fallback
}

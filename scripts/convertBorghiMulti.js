// scripts/convertBorghiMulti.js
const fs = require("fs");
const path = require("path");
const RAW_DIR = path.join(__dirname, "../assets/data/raw");
const OUT_DIR = path.join(__dirname, "../assets/data");
const OUT_PATH = path.join(OUT_DIR, "borghi_min.json");

// Mappa nomi estesi → codici provincia (puoi estendere col tempo)
const PROV2CODE = {
  // Liguria
  GENOVA: "GE",
  IMPERIA: "IM",
  "LA SPEZIA": "SP",
  SAVONA: "SV",
  // Toscana (parziali, completa se vuoi)
  FIRENZE: "FI",
  PISA: "PI",
  LIVORNO: "LI",
  LUCCA: "LU",
  "MASSA-CARRARA": "MS",
  PRATO: "PO",
  PISTOIA: "PT",
  SIENA: "SI",
  AREZZO: "AR",
  GROSSETO: "GR",
  // Piemonte (parziali)
  TORINO: "TO",
  CUNEO: "CN",
  ALESSANDRIA: "AL",
  ASTI: "AT",
  NOVARA: "NO",
  VERCELLI: "VC",
  "VERBANO-CUSIO-OSSOLA": "VB",
  BIELLA: "BI",
};

function toId(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function toNumber(x) {
  if (x === null || x === undefined || x === "") return NaN;
  const n = typeof x === "string" ? Number(x.replace(",", ".")) : Number(x);
  return Number.isFinite(n) ? n : NaN;
}
function toProvCode(v) {
  if (!v) return "";
  const s = String(v).trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(s)) return s;
  return PROV2CODE[s] || "";
}
function pick(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
}
// Deduci regionId dal nome file: "borghi_toscana.json" → "toscana"
function regionFromFilename(fname) {
  const base = path.basename(fname).toLowerCase();
  const m = base.match(/borghi[_-]([a-z0-9\-]+)\.json$/);
  return m ? m[1] : base.replace(/\.json$/, "");
}

// Legge un file raw e prova vari formati:
// 1) array di oggetti { nome|name|comune, lat|latitudine, lon|lng|longitudine, prov|provincia }
// 2) Overpass JSON { elements: [ {type:"node", lat, lon, tags:{name, "addr:province"(?)}} ] }
function readRaw(filePath, regionId) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const j = JSON.parse(raw);

  // Formato Overpass
  if (j && Array.isArray(j.elements)) {
    return j.elements
      .filter(
        (e) =>
          e.type === "node" &&
          e.lat != null &&
          e.lon != null &&
          e.tags &&
          e.tags.name
      )
      .map((e) => {
        // Prova a ricavare la provincia da tags, se presente
        const provTag =
          e.tags["addr:province"] ||
          e.tags["is_in:province"] ||
          e.tags["addr:state_district"] ||
          e.tags["addr:county"];
        const provCode = toProvCode(provTag);
        return {
          id: `${regionId}-${toId(e.tags.name)}`,
          name: e.tags.name,
          lat: Number(e.lat),
          lng: Number(e.lon),
          provinceCode: provCode, // spesso vuoto: ok
          regionId,
        };
      });
  }

  // Formato array "tabellare"
  if (Array.isArray(j)) {
    return j
      .map((r) => {
        const name = pick(r, ["nome", "name", "comune"]);
        const lat = toNumber(pick(r, ["lat", "latitudine"]));
        const lng = toNumber(pick(r, ["lng", "lon", "longitudine"]));
        const prov = pick(r, ["prov", "provincia"]);
        if (!name || !Number.isFinite(lat) || !Number.isFinite(lng))
          return null;
        return {
          id: `${regionId}-${toId(name)}`,
          name: String(name),
          lat,
          lng,
          provinceCode: toProvCode(prov),
          regionId,
        };
      })
      .filter(Boolean);
  }

  console.warn("Formato non riconosciuto per", filePath);
  return [];
}

// Dedup semplice: elimina duplicati per (regionId + name) o coordinate molto vicine
function dedup(list) {
  const byKey = new Map();
  for (const b of list) {
    const key = `${b.regionId}::${b.name.toLowerCase()}`;
    if (!byKey.has(key)) {
      byKey.set(key, b);
    }
  }
  // opzionale: ulteriore dedup per coordinate vicine
  return Array.from(byKey.values());
}

function main() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error("❌ Cartella sorgente non trovata:", RAW_DIR);
    process.exit(1);
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".json"));
  if (!files.length) {
    console.error("❌ Nessun file .json in", RAW_DIR);
    process.exit(1);
  }

  let all = [];
  for (const f of files) {
    const regionId = regionFromFilename(f); // es. "liguria", "toscana", "piemonte"
    const full = path.join(RAW_DIR, f);
    const list = readRaw(full, regionId);
    console.log(`→ ${f}: ${list.length} borghi`);
    all = all.concat(list);
  }

  const final = dedup(all);
  fs.writeFileSync(OUT_PATH, JSON.stringify(final, null, 2), "utf-8");
  console.log(`✅ Creato ${OUT_PATH} con ${final.length} borghi totali.`);
}

main();

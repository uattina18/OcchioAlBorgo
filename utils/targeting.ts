// src/utils/targeting.ts
import borghi from "../../assets/data/borghi_min.json";

// Tipo base del tuo dataset “lite”
type Borgo = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  provinceCode?: string;
  regionId: string;
};

export type TargetPick = {
  borgo: Borgo;
  distanceKm: number;
  bearingToBorgo: number; // 0..360
  headingDiff: number; // errore angolare assoluto in gradi
  score: number; // punteggio (più basso = migliore)
};

// ——— geo helpers ———
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

// distanza Haversine (km)
export function distKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat),
    lat2 = toRad(b.lat);
  const s1 = Math.sin(dLat / 2),
    s2 = Math.sin(dLon / 2);
  const A = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(A));
}

// bearing geodetico A→B (0..360, 0 = Nord)
export function bearing(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const φ1 = toRad(a.lat),
    φ2 = toRad(b.lat);
  const λ1 = toRad(a.lng),
    λ2 = toRad(b.lng);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const brng = Math.atan2(y, x);
  return (toDeg(brng) + 360) % 360;
}

// differenza angolare più piccola tra due direzioni (0..180)
export function angularDiff(aDeg: number, bDeg: number) {
  let d = Math.abs(aDeg - bDeg) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Trova il borgo che stai "guardando" partendo da A con heading dato.
 * @param A posizione utente
 * @param headingDeg bussola (0..360, 0=nord). Usa heading "true" se disponibile; altrimenti magnetic va bene.
 * @param opts opzioni: raggio max, tolleranza angolare, pesi scoring
 */
export function pickBorgoByHeading(
  A: { lat: number; lng: number },
  headingDeg: number,
  opts?: {
    maxKm?: number; // raggio massimo (default 25 km)
    angleTolerance?: number; // tolleranza in gradi (default ±12°)
    angleWeight?: number; // peso errore angolare nello score
    distWeight?: number; // peso distanza nello score
    regionFilter?: string; // es. "liguria" se vuoi filtrare per regione
  }
): TargetPick | null {
  const {
    maxKm = 25,
    angleTolerance = 12,
    angleWeight = 1.0,
    distWeight = 0.15,
    regionFilter,
  } = opts || {};

  const candidates = (borghi as Borgo[]).filter(
    (b) => !regionFilter || b.regionId === regionFilter
  );

  let best: TargetPick | null = null;

  for (const b of candidates) {
    const d = distKm(A, { lat: b.lat, lng: b.lng });
    if (d > maxKm) continue;

    const brng = bearing(A, { lat: b.lat, lng: b.lng });
    const diff = angularDiff(headingDeg, brng);

    if (diff > angleTolerance) continue; // fuori dal "cono" di sguardo

    // punteggio composito: più basso è meglio
    const score = angleWeight * diff + distWeight * d;

    if (!best || score < best.score) {
      best = {
        borgo: b,
        distanceKm: d,
        bearingToBorgo: brng,
        headingDiff: diff,
        score,
      };
    }
  }

  return best;
}

// src/data/BorghiRegister.ts

import liguria from "./raw/borghi_liguria.json";
import piemonte from "./raw/borghi_piemonte.json";
import toscana from "./raw/borghi_toscana.json";

export type Borgo = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  provinceCode?: string;
  regionId: string;
};

// normalizza ogni dataset
function mapLiguria(): Borgo[] {
  return (liguria as any[]).map((b, i) => ({
    id: b.id?.toString() || `lig-${i}`,
    name: b.tags?.name || "Senza nome",
    lat: b.lat,
    lng: b.lon,
    provinceCode: b.tags?.["is_in:province"] || undefined,
    regionId: "liguria",
  }));
}

function mapPiemonte(): Borgo[] {
  return (piemonte as any[]).map((b, i) => ({
    id: b.id?.toString() || `pie-${i}`,
    name: b.tags?.name || "Senza nome",
    lat: b.lat,
    lng: b.lon,
    provinceCode: b.tags?.["is_in:province"] || undefined,
    regionId: "piemonte",
  }));
}

function mapToscana(): Borgo[] {
  return (toscana as any[]).map((b, i) => ({
    id: b.id?.toString() || `tos-${i}`,
    name: b.tags?.name || "Senza nome",
    lat: b.lat,
    lng: b.lon,
    provinceCode: b.tags?.["is_in:province"] || undefined,
    regionId: "toscana",
  }));
}

// registro completo
export const BORGHIREGISTER: Borgo[] = [
  ...mapLiguria(),
  ...mapPiemonte(),
  ...mapToscana(),
];

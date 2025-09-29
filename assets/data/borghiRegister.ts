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

function mapLiguria(): Borgo[] {
  return (liguria.elements as any[]).map((b, i) => ({
    id: b.id?.toString() || `lig-${i}`,
    name: b.tags?.["name:it"] || b.tags?.name || "Senza nome",
    lat: b.lat,
    lng: b.lon,
    provinceCode: b.tags?.["is_in:province"] || undefined,
    regionId: "liguria",
  }));
}

function mapPiemonte(): Borgo[] {
  return (piemonte.elements as any[]).map((b, i) => ({
    id: b.id?.toString() || `pie-${i}`,
    name: b.tags?.["name:it"] || b.tags?.name || "Senza nome",
    lat: b.lat,
    lng: b.lon,
    provinceCode: b.tags?.["is_in:province"] || undefined,
    regionId: "piemonte",
  }));
}

function mapToscana(): Borgo[] {
  return (toscana.elements as any[]).map((b, i) => ({
    id: b.id?.toString() || `tos-${i}`,
    name: b.tags?.["name:it"] || b.tags?.name || "Senza nome",
    lat: b.lat,
    lng: b.lon,
    provinceCode: b.tags?.["is_in:province"] || undefined,
    regionId: "toscana",
  }));
}

export const BORGHIREGISTER: Borgo[] = [
  ...mapLiguria(),
  ...mapPiemonte(),
  ...mapToscana(),
];

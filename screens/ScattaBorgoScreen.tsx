import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Compass as CompassIcon,
  MapPin,
  Camera as CamIcon,
  Check,
  X,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { useColors } from "../src/theme/ThemeContext";

// ⬇️ Importa i borghi da JSON (mettilo in assets/data)
import borghiData from "../assets/data/borghi_liguria.json";

/* -------------------- tipi + parser robusto -------------------- */
type RawBorgo = any;
type Borgo = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  comune?: string;
  img?: string;
};

function pick(o: any, keys: string[]) {
  for (const k of keys) if (o && o[k] != null && o[k] !== "") return o[k];
  return null;
}
function toNum(x: any): number | null {
  if (x == null) return null;
  const n = typeof x === "string" ? parseFloat(x.replace(",", ".")) : Number(x);
  return Number.isFinite(n) ? n : null;
}
function normalizeBorgo(r: RawBorgo, idx: number): Borgo {
  const name = String(
    pick(r, ["name", "nome", "borgo", "comune", "localita"]) ??
      `Borgo ${idx + 1}`
  );
  const lat = toNum(
    pick(r, ["lat", "latitude", "Lat", "LAT", "y", "coord_y", "latitudine"])
  );
  const lon = toNum(
    pick(r, [
      "lon",
      "lng",
      "long",
      "longitude",
      "Lon",
      "LON",
      "x",
      "coord_x",
      "longitudine",
    ])
  );
  const comune = pick(r, ["comune", "municipio", "city"]) ?? undefined;
  const img = pick(r, ["img", "image", "photo", "foto", "cover"]) ?? undefined;
  const id = String(pick(r, ["id", "slug", "code"]) ?? `b_${idx}`);
  return { id, name, lat: lat ?? NaN, lon: lon ?? NaN, comune, img };
}
const BORGI: Borgo[] = (borghiData as RawBorgo[])
  .map(normalizeBorgo)
  .filter((b) => Number.isFinite(b.lat) && Number.isFinite(b.lon));

/* -------------------- util geo -------------------- */
function toCardinal(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO", "N"];
  return dirs[Math.round(deg / 45)];
}
function distKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function nearestBorgo(pos: { lat: number; lon: number }) {
  let best: { borgo: Borgo; d: number } | null = null;
  for (const b of BORGI) {
    const d = distKm(pos, { lat: b.lat, lon: b.lon });
    if (!best || d < best.d) best = { borgo: b, d };
  }
  return best;
}

export default function ScattaBorgoScreen() {
  const colors = useColors();
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const TOP_PAD = Math.max(insets.top, 16) + 16;

  // camera
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // location + heading
  const [locPerm, setLocPerm] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [heading, setHeading] = useState<number | null>(null);

  // watch subscriptions
  const locWatch = useRef<Location.LocationSubscription | null>(null);
  const headWatch = useRef<Location.LocationSubscription | null>(null);
  const magSub = useRef<any>(null);

  useEffect(() => {
    (async () => {
      if (!camPerm?.granted) await requestCamPerm();
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocPerm(status === "granted");
      if (status !== "granted")
        Alert.alert(
          "Permesso posizione",
          "Attiva la posizione per trovare il borgo vicino."
        );
    })();
  }, []);

  useEffect(() => {
    if (!locPerm) return;

    // posizione
    (async () => {
      if (locWatch.current) {
        locWatch.current.remove();
        locWatch.current = null;
      }
      locWatch.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (pos) =>
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      );
    })();

    // heading (nativo -> fallback magnetometro)
    (async () => {
      try {
        if (headWatch.current) {
          headWatch.current.remove();
          headWatch.current = null;
        }
        headWatch.current = await (Location as any).watchHeadingAsync(
          (h: any) => {
            if (h?.trueHeading != null) setHeading(h.trueHeading);
            else if (h?.magHeading != null) setHeading(h.magHeading);
          }
        );
      } catch {
        magSub.current = Magnetometer.addListener(({ x, y }) => {
          if (x == null || y == null) return;
          let angle = Math.atan2(y, x) * (180 / Math.PI); // -180..180 (0=Est)
          angle += 90;
          if (angle < 0) angle += 360;
          setHeading(angle);
        });
        Magnetometer.setUpdateInterval(400);
      }
    })();

    return () => {
      if (locWatch.current) {
        locWatch.current.remove();
        locWatch.current = null;
      }
      if (headWatch.current) {
        headWatch.current.remove();
        headWatch.current = null;
      }
      if (magSub.current) {
        magSub.current.remove();
        magSub.current = null;
      }
    };
  }, [locPerm]);

  const suggested = useMemo(() => {
    if (!coords || BORGI.length === 0) return null;
    const n = nearestBorgo(coords);
    return n ? { ...n, within: n.d <= 30 } : null; // 30km soglia
  }, [coords]);

  const takePhoto = async () => {
    try {
      const cam = cameraRef.current;
      if (!cam) return;
      const p = await cam.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
      });
      setPhotoUri(p?.uri || null);
    } catch {
      Alert.alert("Errore fotocamera", "Impossibile scattare la foto.");
    }
  };

  const resetPhoto = () => setPhotoUri(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View
        style={{
          paddingTop: TOP_PAD,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => nav.goBack()}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "Cinzel",
            fontSize: 18,
            color: colors.text,
          }}
        >
          Scatta un nuovo borgo
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Corpo */}
      <View style={{ flex: 1 }}>
        {!camPerm?.granted ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
              Concedi i permessi fotocamera…
            </Text>
          </View>
        ) : photoUri ? (
          <View style={{ flex: 1 }}>
            <Image source={{ uri: photoUri }} style={{ flex: 1 }} />
            <View
              style={[styles.bottomPanel, { backgroundColor: colors.card }]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <CompassIcon size={16} color={colors.text} />
                  <Text
                    style={{
                      color: colors.text,
                      fontFamily: "Cinzel",
                      fontSize: 14,
                    }}
                  >
                    {heading != null
                      ? `${Math.round(heading)}° ${toCardinal(heading)}`
                      : "—°"}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <MapPin size={16} color={colors.text} />
                  <Text style={{ color: colors.text, fontFamily: "Cormorant" }}>
                    {coords
                      ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`
                      : "—"}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 8 }}>
                {BORGI.length === 0 ? (
                  <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
                    Nessun borgo con coordinate valide in borghi_liguria.json
                  </Text>
                ) : suggested ? (
                  <Text style={{ color: colors.text, fontFamily: "Cormorant" }}>
                    Borgo vicino:{" "}
                    <Text style={{ fontFamily: "Cinzel" }}>
                      {suggested.borgo.name}
                    </Text>{" "}
                    ({suggested.d.toFixed(1)} km)
                    {suggested.within ? "" : " – fuori soglia"}
                  </Text>
                ) : (
                  <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
                    Calcolo borgo vicino…
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={resetPhoto}
                  style={[styles.btn, { backgroundColor: "#444" }]}
                >
                  <X size={16} color="#fff" />
                  <Text style={styles.btnText}>Rifai</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // Salva meta/scatto in futuro; per ora apri Esplora
                    // @ts-ignore
                    nav.navigate("Explore");
                  }}
                  style={[
                    styles.btn,
                    { backgroundColor: colors.tint, flex: 1 },
                  ]}
                >
                  <Check size={16} color="#fff" />
                  <Text style={styles.btnText}>Usa e apri Esplora</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
            {/* overlay */}
            <View pointerEvents="none" style={styles.overlayTop}>
              <View style={[styles.pill, { backgroundColor: colors.card }]}>
                <CompassIcon size={16} color={colors.text} />
                <Text style={[styles.pillText, { color: colors.text }]}>
                  {heading != null
                    ? `${Math.round(heading)}° ${toCardinal(heading)}`
                    : "—°"}
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: colors.card }]}>
                <MapPin size={16} color={colors.text} />
                <Text style={[styles.pillText, { color: colors.text }]}>
                  {coords
                    ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`
                    : "—"}
                </Text>
              </View>
            </View>

            <View style={styles.overlayBottom}>
              <TouchableOpacity
                onPress={takePhoto}
                style={[styles.shutter, { backgroundColor: colors.tint }]}
              >
                <CamIcon size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayTop: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pill: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.92,
  },
  pillText: { fontFamily: "Cinzel", fontSize: 12 },

  overlayBottom: {
    position: "absolute",
    bottom: 26,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  shutter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnText: { color: "#fff", fontFamily: "Cinzel", fontSize: 13 },
});

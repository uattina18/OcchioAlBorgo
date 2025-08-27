// screens/ScattaBorgoScreen.tsx
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
  Target,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import * as FileSystem from "expo-file-system";
import { useColors } from "../src/theme/ThemeContext";
import { saveScattoToQueue } from "../utils/scattiStore";
import borghi from "../assets/data/borghi_min.json";
import {
  incBorghiVisitati,
  markProvinceCovered,
  popJustUnlocked,
} from "../utils/badgesEngine";
import { notifyAllJustUnlocked } from "../utils/notificationStore";

/* -------------------- tipi & costanti -------------------- */
type Borgo = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  provinceCode?: string;
  regionId: string;
};
const BORGI: Borgo[] = borghi as Borgo[];

/* -------------------- geo helpers -------------------- */
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;
const clamp360 = (a: number) => ((a % 360) + 360) % 360;

function toCardinal(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO", "N"];
  return dirs[Math.round(deg / 45)];
}
function distKm(
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
function bearing(
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
  return clamp360(toDeg(Math.atan2(y, x)));
}
function angularDiff(aDeg: number, bDeg: number) {
  let d = Math.abs(clamp360(aDeg) - clamp360(bDeg));
  return d > 180 ? 360 - d : d;
}
function nearestBorgo(pos: { lat: number; lng: number }, maxKm = 30) {
  let best: { borgo: Borgo; d: number } | null = null;
  for (const b of BORGI) {
    const d = distKm(pos, { lat: b.lat, lng: b.lng });
    if (d <= maxKm && (!best || d < best.d)) best = { borgo: b, d };
  }
  return best;
}

/** Sceglie il borgo lungo la direzione (cono ±tol gradi) con punteggio distanza+angolo */
function pickBorgoByHeading(
  A: { lat: number; lng: number },
  headingDeg: number,
  opts?: {
    maxKm?: number;
    tol?: number;
    angleW?: number;
    distW?: number;
    regionId?: string;
  }
) {
  const maxKm = opts?.maxKm ?? 25;
  const tol = opts?.tol ?? 12; // ±12°
  const angleW = opts?.angleW ?? 1.0;
  const distW = opts?.distW ?? 0.15;
  const regionId = opts?.regionId;

  let best: {
    borgo: Borgo;
    d: number;
    brng: number;
    diff: number;
    score: number;
  } | null = null;

  for (const b of BORGI) {
    if (regionId && b.regionId !== regionId) continue;
    const d = distKm(A, { lat: b.lat, lng: b.lng });
    if (d > maxKm) continue;
    const brng = bearing(A, { lat: b.lat, lng: b.lng });
    const diff = angularDiff(headingDeg, brng);
    if (diff > tol) continue;
    const score = angleW * diff + distW * d;
    if (!best || score < best.score) best = { borgo: b, d, brng, diff, score };
  }
  return best;
}

/* -------------------- componente -------------------- */
export default function ScattaBorgoScreen() {
  const colors = useColors();
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  // camera
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // location + heading
  const [locPerm, setLocPerm] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [heading, setHeading] = useState<number | null>(null);

  // watches
  const locWatch = useRef<Location.LocationSubscription | null>(null);
  const headWatch = useRef<{ remove: () => void } | null>(null);
  const magSub = useRef<any>(null);

  // smoothing heading
  const headingBuf = useRef<number[]>([]);

  useEffect(() => {
    (async () => {
      if (!camPerm?.granted) await requestCamPerm();
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocPerm(status === "granted");
      if (status !== "granted") {
        Alert.alert(
          "Permesso posizione",
          "Attiva la posizione per trovare il borgo che stai inquadrando."
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!locPerm) return;

    // posizione
    (async () => {
      locWatch.current?.remove();
      locWatch.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
          timeInterval: 1500,
        },
        (pos) =>
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    })();

    // heading: preferisci quello nativo → fallback magnetometro
    (async () => {
      try {
        headWatch.current?.remove();
        // @ts-ignore: watchHeadingAsync esiste a runtime
        headWatch.current = await (Location as any).watchHeadingAsync(
          (h: any) => {
            const raw =
              typeof h?.trueHeading === "number"
                ? h.trueHeading
                : h?.magHeading;
            if (typeof raw === "number" && Number.isFinite(raw)) {
              pushHeading(clamp360(raw));
            }
          }
        );
      } catch {
        magSub.current?.remove?.();
        magSub.current = Magnetometer.addListener(({ x, y }) => {
          if (x == null || y == null) return;
          // atan2(y,x): 0° = Est; ruoto per avere 0° = Nord
          let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
          pushHeading(clamp360(angle));
        });
        Magnetometer.setUpdateInterval(400);
      }
    })();

    return () => {
      locWatch.current?.remove();
      headWatch.current?.remove();
      magSub.current?.remove?.();
      locWatch.current = null;
      headWatch.current = null;
      magSub.current = null;
      headingBuf.current = [];
    };
  }, [locPerm]);

  function pushHeading(h: number) {
    const buf = headingBuf.current;
    buf.push(h);
    if (buf.length > 12) buf.shift(); // media ultimi ~12 campioni
    // media circolare
    let x = 0,
      y = 0;
    for (const a of buf) {
      const r = toRad(a);
      x += Math.cos(r);
      y += Math.sin(r);
    }
    const avg = clamp360(toDeg(Math.atan2(y / buf.length, x / buf.length)));
    setHeading(avg);
  }

  // suggerimento: heading-based, fallback nearest
  const suggested = useMemo(() => {
    if (!coords || BORGI.length === 0) return null;

    if (heading != null) {
      const pick = pickBorgoByHeading(coords, heading, {
        maxKm: 25,
        tol: 12 /*, regionId: "liguria" */,
      });
      if (pick) {
        return {
          mode: "heading" as const,
          borgo: pick.borgo,
          d: pick.d,
          brng: pick.brng,
          diff: pick.diff,
        };
      }
    }
    const near = nearestBorgo(coords, 30);
    return near
      ? { mode: "nearest" as const, borgo: near.borgo, d: near.d }
      : null;
  }, [coords, heading]);

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

  const confirmUse = async () => {
    try {
      if (!suggested || !photoUri || !coords || heading == null) {
        Alert.alert(
          "Attenzione",
          "Scatta una foto e conferma prima di continuare."
        );
        return;
      }

      // ✅ pre-check esistenza file temporaneo
      const src = photoUri.startsWith("file://")
        ? photoUri
        : `file://${photoUri}`;
      const info = await FileSystem.getInfoAsync(src);
      if (!info.exists) {
        Alert.alert(
          "Foto non trovata",
          "La foto temporanea non è più disponibile. Rifai lo scatto e riprova."
        );
        return;
      }

      const b = suggested.borgo;

      // salva offline in coda (sposta/copia il file e crea item pending)
      try {
        await saveScattoToQueue({
          tempUri: photoUri,
          borgoId: b.id,
          borgoName: b.name,
          lat: coords.lat,
          lng: coords.lng,
          heading,
        });
      } catch (err: any) {
        if (String(err?.message) === "SOURCE_MISSING") {
          Alert.alert(
            "Foto non trovata",
            "La foto temporanea non è più disponibile. Rifai lo scatto e riprova."
          );
          return;
        }
        Alert.alert("Errore salvataggio", String(err?.message || err));
        return;
      }

      // ✅ badge dopo salvataggio riuscito
      await incBorghiVisitati(b.regionId);
      if (b.provinceCode) await markProvinceCovered(b.regionId, b.provinceCode);
      const just = await notifyAllJustUnlocked({
        regionId: b.regionId,
        borgoId: b.id,
        borgoName: b.name,
      });
      if (just) Alert.alert("Nuovo badge!", "Hai sbloccato un nuovo badge 🎉");

      Alert.alert("Salvato", "Scatto aggiunto alla coda offline.");
      // @ts-ignore
      nav.navigate("Explore");
    } catch (e) {
      console.warn("confirmUse error:", e);
      Alert.alert("Ops", "Qualcosa è andato storto nel salvataggio.");
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 16) + 16,
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
          <CenterMsg
            text="Concedi i permessi fotocamera…"
            subColor={colors.sub}
          >
            <TouchableOpacity
              onPress={requestCamPerm}
              style={[
                styles.btn,
                { backgroundColor: colors.tint, marginTop: 12 },
              ]}
            >
              <Text style={styles.btnText}>Concedi</Text>
            </TouchableOpacity>
          </CenterMsg>
        ) : photoUri ? (
          <View style={{ flex: 1 }}>
            <Image source={{ uri: photoUri }} style={{ flex: 1 }} />
            <View
              style={[styles.bottomPanel, { backgroundColor: colors.card }]}
            >
              {/* info */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <InfoPill
                  icon={<CompassIcon size={16} color={colors.text} />}
                  text={
                    heading != null
                      ? `${Math.round(heading)}° ${toCardinal(heading)}`
                      : "—°"
                  }
                  textColor={colors.text}
                />
                <InfoPill
                  icon={<MapPin size={16} color={colors.text} />}
                  text={
                    coords
                      ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                      : "—"
                  }
                  textColor={colors.text}
                />
              </View>

              {/* suggerimento */}
              <View style={{ marginTop: 8 }}>
                {BORGI.length === 0 ? (
                  <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
                    Nessun borgo nel dataset.
                  </Text>
                ) : suggested ? (
                  <Text style={{ color: colors.text, fontFamily: "Cormorant" }}>
                    {suggested.mode === "heading" ? (
                      <>
                        <Target size={14} color={colors.text} /> Sto guardando:{" "}
                      </>
                    ) : (
                      "Borgo vicino: "
                    )}
                    <Text style={{ fontFamily: "Cinzel" }}>
                      {suggested.borgo.name}
                    </Text>{" "}
                    ({suggested.d.toFixed(1)} km)
                  </Text>
                ) : (
                  <Text style={{ color: colors.sub, fontFamily: "Cormorant" }}>
                    Calcolo borgo…
                  </Text>
                )}
              </View>

              {/* azioni */}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={resetPhoto}
                  style={[styles.btn, { backgroundColor: "#444" }]}
                >
                  <X size={16} color="#fff" />
                  <Text style={styles.btnText}>Rifai</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmUse}
                  style={[
                    styles.btn,
                    { backgroundColor: colors.tint, flex: 1 },
                  ]}
                >
                  <Check size={16} color="#fff" />
                  <Text style={styles.btnText}>Usa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
            {/* overlay */}
            <View pointerEvents="none" style={styles.overlayTop}>
              <InfoPill
                icon={<CompassIcon size={16} color={colors.text} />}
                text={
                  heading != null
                    ? `${Math.round(heading)}° ${toCardinal(heading)}`
                    : "—°"
                }
                textColor={colors.text}
              />
              <InfoPill
                icon={<MapPin size={16} color={colors.text} />}
                text={
                  coords
                    ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                    : "—"
                }
                textColor={colors.text}
              />
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

/* -------------------- piccoli UI helpers -------------------- */
function CenterMsg({
  text,
  subColor,
  children,
}: {
  text: string;
  subColor: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: subColor, fontFamily: "Cormorant" }}>{text}</Text>
      {children}
    </View>
  );
}
function InfoPill({
  icon,
  text,
  textColor,
}: {
  icon: React.ReactNode;
  text: string;
  textColor: string;
}) {
  return (
    <View style={styles.pill}>
      {icon}
      <Text style={[styles.pillText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

/* -------------------- styles -------------------- */
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
    backgroundColor: "rgba(0,0,0,0.25)",
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

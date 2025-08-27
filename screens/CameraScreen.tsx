// screens/CameraScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type CameraCapturedPicture,
} from "expo-camera";
import * as Location from "expo-location";
import type { LocationSubscription, LocationObject } from "expo-location";
import { Magnetometer, type MagnetometerMeasurement } from "expo-sensors";
import * as FileSystem from "expo-file-system";
import * as Network from "expo-network";
import { useNavigation } from "@react-navigation/native";

type Coords = { lat: number | null; lon: number | null; acc?: number | null };
type ShotPayload = {
  uri: string | null;
  lat: number | null;
  lon: number | null;
  heading: number | null;
  ts: number;
};

export default function CameraScreen(): JSX.Element {
  const navigation = useNavigation();
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const [coords, setCoords] = useState<Coords>({
    lat: null,
    lon: null,
    acc: null,
  });
  const [locPermGranted, setLocPermGranted] = useState(false);
  const locSubRef = useRef<LocationSubscription | null>(null);

  const [heading, setHeading] = useState<number | null>(null);
  const magSubRef = useRef<{ remove: () => void } | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const [pendingShot, setPendingShot] = useState<ShotPayload | null>(null);

  useEffect(() => {
    (async () => {
      // Camera
      if (!camPerm?.granted) await requestCamPerm();

      // Location + watcher continuo
      const loc = await Location.requestForegroundPermissionsAsync();
      const granted = loc.status === "granted";
      setLocPermGranted(granted);
      if (granted) {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy ?? null,
        });

        locSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 1500,
            distanceInterval: 2,
          },
          (p: LocationObject) =>
            setCoords({
              lat: p.coords.latitude,
              lon: p.coords.longitude,
              acc: p.coords.accuracy ?? null,
            })
        );
      }

      // Rete
      try {
        const s = await Network.getNetworkStateAsync();
        setIsOnline(Boolean(s.isConnected && s.isInternetReachable));
      } catch {
        setIsOnline(true);
      }

      // Bussola
      const sub = Magnetometer.addListener((m: MagnetometerMeasurement) => {
        const angle = Math.atan2(m.y, m.x) * (180 / Math.PI);
        setHeading((angle + 360) % 360);
      });
      Magnetometer.setUpdateInterval(400);
      magSubRef.current = sub;
    })();

    return () => {
      magSubRef.current?.remove();
      if (locSubRef.current) {
        locSubRef.current.remove();
        locSubRef.current = null;
      }
    };
  }, [camPerm?.granted]);

  const saveScattoToQueue = async (payload: ShotPayload) => {
    try {
      const path = FileSystem.documentDirectory + "scatti_queue.json";
      let arr: ShotPayload[] = [];
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        const raw = await FileSystem.readAsStringAsync(path);
        if (raw) arr = JSON.parse(raw) as ShotPayload[];
      }
      arr.push(payload);
      await FileSystem.writeAsStringAsync(path, JSON.stringify(arr));
      console.log("Queued scatto", payload);
    } catch (e) {
      console.log("saveScattoToQueue error", e);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      setSaving(true);
      // @ts-expect-error CameraView espone takePictureAsync a runtime
      const photo: CameraCapturedPicture =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
      const uri = photo?.uri ?? null;
      setLastPhotoUri(uri);

      const payload: ShotPayload = {
        uri,
        lat: coords.lat,
        lon: coords.lon,
        heading,
        ts: Date.now(),
      };
      setPendingShot(payload);

      if (isOnline) {
        await saveScattoToQueue(payload);
      }
    } catch (e) {
      console.log("takePhoto error", e);
    } finally {
      setSaving(false);
    }
  };

  if (!camPerm)
    return (
      <View style={styles.center}>
        <Text>Verifica permessi fotocamera…</Text>
      </View>
    );
  if (!camPerm.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>La fotocamera richiede il permesso.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestCamPerm}>
          <Text style={styles.btnText}>Concedi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={(r) => (cameraRef.current = r)}
        style={styles.camera}
        facing="back"
      />
      <View style={styles.overlay}>
        <Text style={styles.meta}>
          {`GPS: ${
            coords.lat !== null && coords.lon !== null
              ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}${
                  coords.acc ? ` (±${Math.round(coords.acc)}m)` : ""
                }`
              : "—"
          }  |  Heading: ${
            heading !== null ? `${Math.round(heading)}°` : "—"
          }  |  Rete: ${isOnline ? "online" : "offline"}`}
        </Text>

        {!pendingShot ? (
          <TouchableOpacity
            onPress={takePhoto}
            style={styles.shutter}
            disabled={saving || !locPermGranted}
          >
            <Text style={styles.shutterText}>
              {saving ? "Salvo…" : locPermGranted ? "SCATTA" : "GPS non attivo"}
            </Text>
          </TouchableOpacity>
        ) : isOnline ? (
          <Text style={styles.metaSmall}>
            Scatto pronto. (Online) — riconoscimento in step successivo
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.shutter}
            disabled={saving}
            onPress={async () => {
              if (!pendingShot) return;
              setSaving(true);
              await saveScattoToQueue(pendingShot);
              setSaving(false);
              setPendingShot(null);
              // @ts-ignore
              navigation.navigate("Explore");
            }}
          >
            <Text style={styles.shutterText}>{saving ? "Salvo…" : "USA"}</Text>
          </TouchableOpacity>
        )}

        {lastPhotoUri ? (
          <Text style={styles.metaSmall}>
            Ultima foto:{" "}
            {Platform.select({ ios: lastPhotoUri, android: lastPhotoUri })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  meta: { color: "#fff", marginBottom: 8 },
  metaSmall: { color: "#ddd", marginTop: 8, fontSize: 12 },
  shutter: {
    alignSelf: "center",
    backgroundColor: "#3a602a",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
  },
  shutterText: { color: "#fff", fontWeight: "600", letterSpacing: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: { fontSize: 16, marginBottom: 12 },
  btn: {
    backgroundColor: "#3a602a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});

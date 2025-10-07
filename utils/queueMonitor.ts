// src/utils/queueMonitor.ts
import * as Network from "expo-network";
import * as Battery from "expo-battery";
import { canProcessNow, processQueue, mockUpload } from "./scattiStore";

let unsubNet: (() => void) | null = null;
let unsubBatt: (() => void) | null = null;
let running = false;

async function tryProcess() {
  if (running) return;
  if (!(await canProcessNow())) return;
  running = true;
  try {
    await processQueue(mockUpload); // <--- sostituisci con la tua uploadFn quando avrai il backend
  } finally {
    running = false;
  }
}

/** Avvia i listener; chiamalo una sola volta (es. in App.ts) */
export async function startQueueMonitor() {
  // primo tentativo all’avvio
  tryProcess();

  // rete
  const netSub = Network.addNetworkStateListener(() => tryProcess());
  unsubNet = () => netSub.remove();

  // batteria (low power / livelli)
  const battSub1 = Battery.addBatteryLevelListener(() => tryProcess());
  const battSub2 = Battery.addLowPowerModeListener(() => tryProcess());
  unsubBatt = () => {
    battSub1.remove();
    battSub2.remove();
  };
}

/** Ferma i listener; opzionale in unmount globale */
export function stopQueueMonitor() {
  unsubNet?.();
  unsubNet = null;
  unsubBatt?.();
  unsubBatt = null;
}

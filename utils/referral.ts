// src/utils/referral.ts
import * as SecureStore from "expo-secure-store";

// chiave di storage
const KEY = "referral_code_v1";

// opzionale: usa un prefisso per riconoscere l'app
const PREFIX = "OAB"; // Occhio Al Borgo

// genera un codice alfanumerico maiuscolo, es. OAB-9K7F-2TQH
function randomCode(len = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // niente 0/O, 1/I
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// se hai uno username e vuoi un codice "stabile", puoi mescolarlo
// con un pizzico di random per evitare collisioni
function fromUsername(username: string) {
  const base = username
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4)
    .padEnd(4, "X");
  return `${base}${randomCode(6)}`; // es. MART7QF2XK
}

// API principale: ottieni o crea il codice
export async function getOrCreateReferralCode(username?: string) {
  const existing = await SecureStore.getItemAsync(KEY);
  if (existing) return existing;

  const core = username ? fromUsername(username) : randomCode(10);
  const pretty = `${PREFIX}-${core.slice(0, 4)}-${core.slice(
    4,
    8
  )}`.toUpperCase();
  await SecureStore.setItemAsync(KEY, pretty);
  return pretty;
}

// opzionale: reset (utile in debug)
export async function resetReferralCode() {
  await SecureStore.deleteItemAsync(KEY);
}

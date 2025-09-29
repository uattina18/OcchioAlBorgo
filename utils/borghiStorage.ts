import * as SecureStore from "expo-secure-store";

const SAVED_KEY = "saved_borghi";
const VISITED_KEY = "visited_borghi";

// Helpers base
async function load(key: string): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function save(key: string, list: string[]) {
  await SecureStore.setItemAsync(key, JSON.stringify(list));
}

// 🔖 BORGHISALVATI

export async function getSavedBorghi(): Promise<string[]> {
  return await load(SAVED_KEY);
}

export async function saveBorgo(id: string) {
  const current = await getSavedBorghi();
  if (!current.includes(id)) {
    await save(SAVED_KEY, [...current, id]);
  }
}

export async function removeSavedBorgo(id: string) {
  const current = await getSavedBorghi();
  await save(
    SAVED_KEY,
    current.filter((x) => x !== id)
  );
}

export async function isBorgoSaved(id: string): Promise<boolean> {
  const current = await getSavedBorghi();
  return current.includes(id);
}

export async function toggleBorgo(id: string): Promise<void> {
  const current = await getSavedBorghi();
  if (current.includes(id)) {
    await removeSavedBorgo(id);
  } else {
    await saveBorgo(id);
  }
}

// ✅ BORGHIVISITATI

export async function getVisitedBorghi(): Promise<string[]> {
  return await load(VISITED_KEY);
}

export async function markBorgoVisited(id: string) {
  const current = await getVisitedBorghi();
  if (!current.includes(id)) {
    await save(VISITED_KEY, [...current, id]);
  }
  // Rimuovilo da quelli salvati, se presente
  await removeSavedBorgo(id);
}

export async function isBorgoVisited(id: string): Promise<boolean> {
  const current = await getVisitedBorghi();
  return current.includes(id);
}

export async function removeVisitedBorgo(id: string) {
  const current = await getVisitedBorghi();
  await save(
    VISITED_KEY,
    current.filter((x) => x !== id)
  );
}

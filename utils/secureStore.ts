import * as Keychain from 'react-native-keychain';

/**
 * Salva un valore in modo sicuro
 */
export async function saveItem(key: string, value: string): Promise<void> {
  try {
    await Keychain.setGenericPassword(key, value, {
      service: key,
      accessible: Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    console.error('Errore nel salvataggio Keychain:', error);
  }
}

/**
 * Recupera un valore salvato
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Errore nel recupero Keychain:', error);
    return null;
  }
}

/**
 * Elimina un valore salvato
 */
export async function deleteItem(key: string): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: key });
  } catch (error) {
    console.error('Errore nella cancellazione Keychain:', error);
  }
}

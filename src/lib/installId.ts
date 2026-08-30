import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * install_id is the join key for every analytics event and, later, for
 * sync. It is unbackfillable: get the read order right once, here, and
 * never re-derive it anywhere else.
 *
 * Precedence: expo-secure-store (the keychain / Keystore entry) is the
 * authority. The `profile.install_id` column in SQLite is a cache of it,
 * written from this value, never the other way round. This matters
 * because app data can be cleared (wiping SQLite) while the keychain
 * entry survives, or vice versa on some Android OEM skins — without a
 * fixed precedence, cohorts silently fragment across reinstalls.
 *
 * expo-secure-store has no web implementation (no keychain equivalent
 * in a browser), so web falls back to localStorage — fine here since
 * install_id isn't a secret.
 */
const SECURE_STORE_KEY = 'foundation.install_id';

let cached: string | null = null;

async function getStoredInstallId(): Promise<string | null> {
  if (Platform.OS === 'web') return window.localStorage.getItem(SECURE_STORE_KEY);
  return SecureStore.getItemAsync(SECURE_STORE_KEY);
}

async function persistInstallId(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(SECURE_STORE_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(SECURE_STORE_KEY, value);
}

export async function getOrCreateInstallId(): Promise<string> {
  if (cached) return cached;

  const existing = await getStoredInstallId();
  if (existing) {
    cached = existing;
    return existing;
  }

  const fresh = Crypto.randomUUID();
  await persistInstallId(fresh);
  cached = fresh;
  return fresh;
}

/** Test-only escape hatch. Never call from app code. */
export function __resetInstallIdCacheForTests(): void {
  cached = null;
}

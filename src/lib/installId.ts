import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

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
 */
const SECURE_STORE_KEY = 'foundation.install_id';

let cached: string | null = null;

export async function getOrCreateInstallId(): Promise<string> {
  if (cached) return cached;

  const existing = await SecureStore.getItemAsync(SECURE_STORE_KEY);
  if (existing) {
    cached = existing;
    return existing;
  }

  const fresh = Crypto.randomUUID();
  await SecureStore.setItemAsync(SECURE_STORE_KEY, fresh);
  cached = fresh;
  return fresh;
}

/** Test-only escape hatch. Never call from app code. */
export function __resetInstallIdCacheForTests(): void {
  cached = null;
}

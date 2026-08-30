import type { SQLiteDatabase } from 'expo-sqlite';

import { CURRENT_VERSION, MIGRATIONS } from './schema';

/**
 * Passed as SQLiteProvider's onInit. Runs once per app launch, before
 * children render. Idempotent: re-running against an up-to-date DB is a
 * no-op because currentVersion >= CURRENT_VERSION short-circuits.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= CURRENT_VERSION) {
    return;
  }

  for (let i = currentVersion; i < CURRENT_VERSION; i++) {
    const migrationSql = MIGRATIONS[i];
    if (!migrationSql) {
      throw new Error(
        `Missing migration for version ${i} -> ${i + 1}. MIGRATIONS has ${MIGRATIONS.length} entries.`,
      );
    }
    await db.execAsync(migrationSql);
    currentVersion = i + 1;
    await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
  }
}

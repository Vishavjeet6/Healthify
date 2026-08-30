import type { SQLiteDatabase } from 'expo-sqlite';

import { getSetting, setSetting } from '../../db/queries/settings';
import type { SyncProvider, SyncStatus } from './types';

const OPT_IN_KEY = 'sync_opted_in';

/**
 * No real backend. Records opt-in state and drains sync_queue rows as
 * "synced" locally, so the queue and the opt-in flow are both fully
 * exercisable before Supabase exists. See plan Work item 9.
 */
export class MockSyncProvider implements SyncProvider {
  constructor(private db: SQLiteDatabase) {}

  async isOptedIn(): Promise<boolean> {
    return (await getSetting(this.db, OPT_IN_KEY)) === 'true';
  }

  async optIn(_email: string): Promise<void> {
    await setSetting(this.db, OPT_IN_KEY, 'true');
  }

  async optOut(): Promise<void> {
    await setSetting(this.db, OPT_IN_KEY, 'false');
  }

  async getStatus(): Promise<SyncStatus> {
    const optedIn = await this.isOptedIn();
    if (!optedIn) return 'off';
    const row = await this.db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) as n FROM sync_queue WHERE synced_at IS NULL',
    );
    return (row?.n ?? 0) > 0 ? 'pending' : 'synced';
  }

  async flush(): Promise<void> {
    await this.db.runAsync(
      'UPDATE sync_queue SET synced_at = ? WHERE synced_at IS NULL',
      new Date().toISOString(),
    );
  }
}

export async function enqueueSync(
  db: SQLiteDatabase,
  entity: string,
  entityId: string,
  op: 'insert' | 'update',
  payload: unknown,
): Promise<void> {
  await db.runAsync(
    'INSERT INTO sync_queue (entity, entity_id, op, payload_json, created_at) VALUES (?, ?, ?, ?, ?)',
    entity,
    entityId,
    op,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}

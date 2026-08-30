import type { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export async function recordSessionCompletion(
  db: SQLiteDatabase,
  sessionId: string,
  programDay: number,
  durationS: number | null,
): Promise<void> {
  const id = Crypto.randomUUID();
  await db.runAsync(
    `INSERT INTO session_completions (id, session_id, program_day, completed_at, duration_s)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(session_id) DO NOTHING`,
    id,
    sessionId,
    programDay,
    new Date().toISOString(),
    durationS,
  );
}

export async function isSessionCompleted(db: SQLiteDatabase, sessionId: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM session_completions WHERE session_id = ?',
    sessionId,
  );
  return row != null;
}

export async function countSessionCompletions(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM session_completions',
  );
  return row?.n ?? 0;
}

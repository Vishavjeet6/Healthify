import type { SQLiteDatabase } from 'expo-sqlite';

import { toLocalDateString } from '../../lib/date';

export type DailyLog = {
  logDate: string;
  morningErection: boolean | null;
  sleepHours: number | null;
  drinks: number | null;
};

type DailyLogRow = {
  log_date: string;
  morning_erection: number | null;
  sleep_hours: number | null;
  drinks: number | null;
};

function fromRow(row: DailyLogRow): DailyLog {
  return {
    logDate: row.log_date,
    morningErection: row.morning_erection == null ? null : row.morning_erection === 1,
    sleepHours: row.sleep_hours,
    drinks: row.drinks,
  };
}

/** Upserts today's log with a partial patch — each field is independently optional. */
export async function upsertTodayLog(
  db: SQLiteDatabase,
  patch: Partial<Pick<DailyLog, 'morningErection' | 'sleepHours' | 'drinks'>>,
): Promise<void> {
  const today = toLocalDateString(new Date());
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<DailyLogRow>(
    'SELECT * FROM daily_logs WHERE log_date = ?',
    today,
  );

  const merged = {
    morningErection: patch.morningErection ?? existing?.morning_erection ?? null,
    sleepHours: patch.sleepHours ?? existing?.sleep_hours ?? null,
    drinks: patch.drinks ?? existing?.drinks ?? null,
  };

  await db.runAsync(
    `INSERT INTO daily_logs (log_date, morning_erection, sleep_hours, drinks, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(log_date) DO UPDATE SET
       morning_erection = excluded.morning_erection,
       sleep_hours = excluded.sleep_hours,
       drinks = excluded.drinks,
       updated_at = excluded.updated_at`,
    today,
    merged.morningErection == null ? null : merged.morningErection ? 1 : 0,
    merged.sleepHours,
    merged.drinks,
    now,
  );
}

export async function listRecentLogs(db: SQLiteDatabase, days = 14): Promise<DailyLog[]> {
  const rows = await db.getAllAsync<DailyLogRow>(
    'SELECT * FROM daily_logs ORDER BY log_date DESC LIMIT ?',
    days,
  );
  return rows.map(fromRow);
}

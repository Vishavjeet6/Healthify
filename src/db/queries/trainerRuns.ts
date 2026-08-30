import type { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export type TrainerRun = {
  id: string;
  protocolId: string;
  level: number;
  completedAt: string;
  sets: number;
  reps: number;
  holdS: number;
  restS: number;
  perceivedDifficulty: number | null;
};

type TrainerRunRow = {
  id: string;
  protocol_id: string;
  level: number;
  completed_at: string;
  sets: number;
  reps: number;
  hold_s: number;
  rest_s: number;
  perceived_difficulty: number | null;
};

function fromRow(row: TrainerRunRow): TrainerRun {
  return {
    id: row.id,
    protocolId: row.protocol_id,
    level: row.level,
    completedAt: row.completed_at,
    sets: row.sets,
    reps: row.reps,
    holdS: row.hold_s,
    restS: row.rest_s,
    perceivedDifficulty: row.perceived_difficulty,
  };
}

export async function insertTrainerRun(
  db: SQLiteDatabase,
  input: Omit<TrainerRun, 'id' | 'completedAt'>,
): Promise<TrainerRun> {
  const id = Crypto.randomUUID();
  const completedAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO trainer_runs (id, protocol_id, level, completed_at, sets, reps, hold_s, rest_s, perceived_difficulty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.protocolId,
    input.level,
    completedAt,
    input.sets,
    input.reps,
    input.holdS,
    input.restS,
    input.perceivedDifficulty,
  );
  return { id, completedAt, ...input };
}

/** Most recent runs first, for progression checks. */
export async function listTrainerRuns(
  db: SQLiteDatabase,
  protocolId: string,
  limit = 20,
): Promise<TrainerRun[]> {
  const rows = await db.getAllAsync<TrainerRunRow>(
    'SELECT * FROM trainer_runs WHERE protocol_id = ? ORDER BY completed_at DESC LIMIT ?',
    protocolId,
    limit,
  );
  return rows.map(fromRow);
}

export async function countTrainerRuns(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM trainer_runs');
  return row?.n ?? 0;
}

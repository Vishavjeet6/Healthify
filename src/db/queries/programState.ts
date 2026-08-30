import type { SQLiteDatabase } from 'expo-sqlite';

import { toLocalDateString } from '../../lib/date';

export type ProgramState = {
  startedAt: string | null;
  currentDay: number;
  lastCompletedDate: string | null;
  streakCount: number;
  longestStreak: number;
};

type ProgramStateRow = {
  started_at: string | null;
  current_day: number;
  last_completed_date: string | null;
  streak_count: number;
  longest_streak: number;
};

function fromRow(row: ProgramStateRow): ProgramState {
  return {
    startedAt: row.started_at,
    currentDay: row.current_day,
    lastCompletedDate: row.last_completed_date,
    streakCount: row.streak_count,
    longestStreak: row.longest_streak,
  };
}

export async function ensureProgramState(db: SQLiteDatabase): Promise<ProgramState> {
  const existing = await db.getFirstAsync<ProgramStateRow>(
    'SELECT * FROM program_state WHERE id = 1',
  );
  if (existing) return fromRow(existing);

  await db.runAsync(
    'INSERT INTO program_state (id, current_day, streak_count, longest_streak) VALUES (1, 1, 0, 0)',
  );
  return { startedAt: null, currentDay: 1, lastCompletedDate: null, streakCount: 0, longestStreak: 0 };
}

/**
 * Pure streak/day-advance decision, kept separate from the DB read/write
 * so it's unit-testable without a live SQLite instance.
 *
 * Two separate concerns, deliberately not conflated:
 *  - currentDay advances every time this is called for a session that
 *    hasn't already been recorded (idempotency against replaying the
 *    *same* session is the caller's job — see recordDayCompleted below
 *    and session/[id].tsx's isSessionCompleted guard). A user who does
 *    two different sessions in one sitting advances by two days.
 *  - the streak counts *consecutive active calendar days*, and must not
 *    be double-incremented when two sessions land on the same local
 *    date — that's the only thing "same date" should suppress.
 *
 * Missing a day never blocks progress and never loses program
 * position — the user simply resumes at currentDay; the streak resets
 * to 1 on any gap. See IMPLEMENTATION_PLAN.md "Today screen".
 */
export function computeDayCompletion(state: ProgramState, today: string): ProgramState {
  const startedAt = state.startedAt ?? new Date().toISOString();
  const nextDay = state.currentDay + 1;

  const sameDateAsLastCompletion = state.lastCompletedDate === today;
  const wasYesterday =
    !sameDateAsLastCompletion &&
    state.lastCompletedDate !== null &&
    isConsecutiveLocalDay(state.lastCompletedDate, today);

  const nextStreak = sameDateAsLastCompletion
    ? state.streakCount // second session today: program advances, streak doesn't double-count
    : wasYesterday
      ? state.streakCount + 1
      : 1;
  const nextLongest = Math.max(state.longestStreak, nextStreak);

  return {
    startedAt,
    currentDay: nextDay,
    lastCompletedDate: today,
    streakCount: nextStreak,
    longestStreak: nextLongest,
  };
}

export function isConsecutiveLocalDay(prevDateStr: string, curDateStr: string): boolean {
  const prev = new Date(`${prevDateStr}T00:00:00`);
  const cur = new Date(`${curDateStr}T00:00:00`);
  const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
  return diffDays === 1;
}

export async function recordDayCompleted(db: SQLiteDatabase): Promise<ProgramState> {
  const state = await ensureProgramState(db);
  const today = toLocalDateString(new Date());
  const next = computeDayCompletion(state, today);

  await db.runAsync(
    `UPDATE program_state
     SET started_at = ?, current_day = ?, last_completed_date = ?, streak_count = ?, longest_streak = ?
     WHERE id = 1`,
    next.startedAt,
    next.currentDay,
    next.lastCompletedDate,
    next.streakCount,
    next.longestStreak,
  );

  return next;
}

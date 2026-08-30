import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureProfile } from '../../db/queries/profile';
import { ensureProgramState } from '../../db/queries/programState';
import { useIntakeStore } from '../intake/intakeStore';

/**
 * __DEV__-only. Wipes local identity/progress tables and re-seeds a
 * blank profile + program state so onboarding can be replayed without
 * reinstalling the app. Keeps the existing install_id — this simulates
 * restarting the flow, not a new device.
 */
export async function logoutForOnboarding(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DELETE FROM profile;
    DELETE FROM program_state;
    DELETE FROM assessments;
    DELETE FROM session_completions;
    DELETE FROM trainer_runs;
    DELETE FROM daily_logs;
  `);
  useIntakeStore.getState().reset();
  await ensureProfile(db);
  await ensureProgramState(db);
}

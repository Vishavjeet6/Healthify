import type { SQLiteDatabase } from 'expo-sqlite';

import { getOrCreateInstallId } from '../../lib/installId';

export type ProgramVariant = 'vascular' | 'psychogenic' | 'mixed';

export type Profile = {
  id: 1;
  installId: string;
  createdAt: string;
  programVariant: ProgramVariant | null;
  intakeJson: string | null;
  onboardingComplete: boolean;
  checkFlagged: boolean;
  checkAcknowledgedAt: string | null;
};

type ProfileRow = {
  id: 1;
  install_id: string;
  created_at: string;
  program_variant: ProgramVariant | null;
  intake_json: string | null;
  onboarding_complete: number;
  check_flagged: number;
  check_acknowledged_at: string | null;
};

function fromRow(row: ProfileRow): Profile {
  return {
    id: 1,
    installId: row.install_id,
    createdAt: row.created_at,
    programVariant: row.program_variant,
    intakeJson: row.intake_json,
    onboardingComplete: row.onboarding_complete === 1,
    checkFlagged: row.check_flagged === 1,
    checkAcknowledgedAt: row.check_acknowledged_at,
  };
}

/**
 * Ensures a profile row exists, reconciled against the secure-store
 * install_id (the authority — see lib/installId.ts). Safe to call on
 * every app boot; idempotent.
 */
export async function ensureProfile(db: SQLiteDatabase): Promise<Profile> {
  const installId = await getOrCreateInstallId();
  const existing = await db.getFirstAsync<ProfileRow>('SELECT * FROM profile WHERE id = 1');

  if (!existing) {
    const createdAt = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO profile (id, install_id, created_at, onboarding_complete, check_flagged) VALUES (1, ?, ?, 0, 0)',
      installId,
      createdAt,
    );
    return {
      id: 1,
      installId,
      createdAt,
      programVariant: null,
      intakeJson: null,
      onboardingComplete: false,
      checkFlagged: false,
      checkAcknowledgedAt: null,
    };
  }

  if (existing.install_id !== installId) {
    // Secure-store is the authority; correct the cached copy.
    await db.runAsync('UPDATE profile SET install_id = ? WHERE id = 1', installId);
    existing.install_id = installId;
  }

  return fromRow(existing);
}

export async function getProfile(db: SQLiteDatabase): Promise<Profile | null> {
  const row = await db.getFirstAsync<ProfileRow>('SELECT * FROM profile WHERE id = 1');
  return row ? fromRow(row) : null;
}

export async function saveIntake(
  db: SQLiteDatabase,
  variant: ProgramVariant,
  intakeJson: string,
): Promise<void> {
  await db.runAsync(
    'UPDATE profile SET program_variant = ?, intake_json = ? WHERE id = 1',
    variant,
    intakeJson,
  );
}

export async function recordRedFlagCheck(
  db: SQLiteDatabase,
  flagged: boolean,
): Promise<void> {
  await db.runAsync(
    'UPDATE profile SET check_flagged = ?, check_acknowledged_at = ? WHERE id = 1',
    flagged ? 1 : 0,
    new Date().toISOString(),
  );
}

export async function completeOnboarding(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('UPDATE profile SET onboarding_complete = 1 WHERE id = 1');
}

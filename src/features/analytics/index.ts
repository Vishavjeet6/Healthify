import type { SQLiteDatabase } from 'expo-sqlite';

import { getOrCreateInstallId } from '../../lib/installId';

/**
 * Local-only event log. No transport is wired in the MVP — this is a
 * ring buffer for future export, not a live pipeline.
 *
 * Event names and prop keys are a closed allowlist on purpose: see
 * IMPLEMENTATION_PLAN.md "Analytics" — no sexual terms, no condition
 * name, ever, because these strings end up in dashboards and crash
 * logs outside our control once a real transport is wired in.
 */
export type AnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'red_flag_shown'
  | 'red_flag_acknowledged'
  | 'assessment_taken'
  | 'session_started'
  | 'session_completed'
  | 'trainer_run_started'
  | 'trainer_run_finished'
  | 'paywall_viewed'
  | 'purchase_completed'
  | 'backup_opted_in'
  | 'reminder_scheduled';

const RING_BUFFER_LIMIT = 500;

export async function track(
  db: SQLiteDatabase,
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): Promise<void> {
  const installId = await getOrCreateInstallId();
  await db.runAsync(
    'INSERT INTO analytics_events (install_id, event, props_json, created_at) VALUES (?, ?, ?, ?)',
    installId,
    event,
    props ? JSON.stringify(props) : null,
    new Date().toISOString(),
  );

  const countRow = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM analytics_events',
  );
  const count = countRow?.n ?? 0;
  if (count > RING_BUFFER_LIMIT) {
    await db.runAsync(
      `DELETE FROM analytics_events WHERE id IN (
         SELECT id FROM analytics_events ORDER BY id ASC LIMIT ?
       )`,
      count - RING_BUFFER_LIMIT,
    );
  }
}

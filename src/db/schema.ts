/**
 * Schema is versioned via PRAGMA user_version. Each entry in MIGRATIONS
 * is the SQL to move from (index) to (index + 1). Never edit a migration
 * once it has shipped — add a new one. See migrations.ts for the runner.
 */

export const DATABASE_NAME = 'foundation.db';

export const CURRENT_VERSION = 1;

/** Index 0 -> 1 */
const v1 = `
PRAGMA journal_mode = WAL;

CREATE TABLE profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  install_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  program_variant TEXT,
  intake_json TEXT,
  onboarding_complete INTEGER NOT NULL DEFAULT 0,
  check_flagged INTEGER NOT NULL DEFAULT 0,
  check_acknowledged_at TEXT
);

CREATE TABLE assessments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'iief5',
  taken_at TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  severity TEXT NOT NULL,
  answers_json TEXT NOT NULL
);

CREATE TABLE program_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  started_at TEXT,
  current_day INTEGER NOT NULL DEFAULT 1,
  last_completed_date TEXT,
  streak_count INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE session_completions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  program_day INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  duration_s INTEGER,
  UNIQUE(session_id)
);

CREATE TABLE trainer_runs (
  id TEXT PRIMARY KEY,
  protocol_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  hold_s INTEGER,
  rest_s INTEGER,
  perceived_difficulty INTEGER
);

CREATE TABLE daily_logs (
  log_date TEXT PRIMARY KEY,
  morning_erection INTEGER,
  sleep_hours REAL,
  drinks INTEGER,
  updated_at TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  op TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  synced_at TEXT
);

CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  install_id TEXT NOT NULL,
  event TEXT NOT NULL,
  props_json TEXT,
  created_at TEXT NOT NULL
);
`;

/** MIGRATIONS[i] moves the DB from version i to version i + 1. */
export const MIGRATIONS: string[] = [v1];

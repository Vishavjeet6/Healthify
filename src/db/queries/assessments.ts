import type { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export type Severity = 'none' | 'mild' | 'mild-moderate' | 'moderate' | 'severe';

export type Assessment = {
  id: string;
  type: 'iief5';
  takenAt: string;
  totalScore: number;
  severity: Severity;
  answers: number[];
};

type AssessmentRow = {
  id: string;
  type: string;
  taken_at: string;
  total_score: number;
  severity: Severity;
  answers_json: string;
};

function fromRow(row: AssessmentRow): Assessment {
  return {
    id: row.id,
    type: 'iief5',
    takenAt: row.taken_at,
    totalScore: row.total_score,
    severity: row.severity,
    answers: JSON.parse(row.answers_json),
  };
}

export async function insertAssessment(
  db: SQLiteDatabase,
  totalScore: number,
  severity: Severity,
  answers: number[],
): Promise<Assessment> {
  const id = Crypto.randomUUID();
  const takenAt = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO assessments (id, type, taken_at, total_score, severity, answers_json) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    'iief5',
    takenAt,
    totalScore,
    severity,
    JSON.stringify(answers),
  );
  return { id, type: 'iief5', takenAt, totalScore, severity, answers };
}

export async function listAssessments(db: SQLiteDatabase): Promise<Assessment[]> {
  const rows = await db.getAllAsync<AssessmentRow>(
    'SELECT * FROM assessments ORDER BY taken_at ASC',
  );
  return rows.map(fromRow);
}

export async function countAssessments(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM assessments');
  return row?.n ?? 0;
}

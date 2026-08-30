import type { Severity } from '../../db/queries/assessments';

/**
 * IIEF-5: 5 questions, each scored 1-5, total 5-25.
 * See IMPLEMENTATION_PLAN.md "IIEF-5 assessment".
 */
export const IIEF5_QUESTIONS: { id: string; prompt: string }[] = [
  { id: 'confidence', prompt: 'How confident were you that you could get and keep an erection?' },
  {
    id: 'firmness',
    prompt: 'When you had erections, how often were they firm enough for penetration?',
  },
  {
    id: 'maintain-during',
    prompt: 'During intercourse, how often were you able to maintain your erection after penetration?',
  },
  {
    id: 'maintain-difficulty',
    prompt: 'During intercourse, how difficult was it to maintain your erection to completion?',
  },
  { id: 'satisfaction', prompt: 'How often was intercourse satisfactory for you?' },
];

export function scoreIief5(answers: number[]): { total: number; severity: Severity } {
  if (answers.length !== 5) {
    throw new Error(`IIEF-5 requires exactly 5 answers, got ${answers.length}`);
  }
  for (const a of answers) {
    if (!Number.isInteger(a) || a < 1 || a > 5) {
      throw new Error(`IIEF-5 answers must be integers 1-5, got ${a}`);
    }
  }
  const total = answers.reduce((sum, a) => sum + a, 0);
  return { total, severity: severityForScore(total) };
}

export function severityForScore(total: number): Severity {
  if (total >= 22) return 'none';
  if (total >= 17) return 'mild';
  if (total >= 12) return 'mild-moderate';
  if (total >= 8) return 'moderate';
  return 'severe';
}

export const IIEF5_MCID = 4; // minimal clinically important difference, per EDDIG RCT

export const SEVERITY_LABEL: Record<Severity, string> = {
  none: 'No significant difficulty',
  mild: 'Mild difficulty',
  'mild-moderate': 'Mild to moderate difficulty',
  moderate: 'Moderate difficulty',
  severe: 'Severe difficulty',
};

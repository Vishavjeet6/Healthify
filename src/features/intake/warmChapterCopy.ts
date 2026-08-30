import { INTAKE_STEPS, type IntakeStep, type StepId } from './steps';
import type { IntakeAnswers } from './types';

/**
 * Copy specific to the warm onboarding skin (redesign 1b) — a short
 * line of reasoning per chapter, and a compact label per question for
 * its collapsed "receipt" row. Purely presentational: doesn't change
 * any field, prompt, or scoring in steps.ts.
 */
export const WARM_CHAPTER_INTRO: Record<string, string> = {
  basics: 'The basics set the pace the program starts you at.',
  pattern: 'How it began tells us which half of the program to lead with.',
  head: 'Stress and head-space shift which sessions come first.',
  history: 'A few health basics shape what the program leads with.',
};

const RECEIPT_LABEL: Partial<Record<StepId, string>> = {
  age: 'Age',
  bmi: 'BMI',
  smoker: 'Smokes',
  sedentary: 'Activity level',
  onset: 'Started',
  situational: 'Varies by situation',
  morningErections: 'Morning erections',
  selfReportedAnxiety: 'Anxiety plays a role',
  recentLifeStressor: 'Recent stressor',
  diagnosedHypertension: 'Blood pressure',
  diagnosedDiabetes: 'Diabetes',
  diabetesTreated: 'Diabetes treated',
  diagnosedHighCholesterol: 'Cholesterol',
  diagnosedCardiovascularDisease: 'Heart condition',
  cardiovascularDiseaseTreated: 'Condition treated',
  exertionalSymptoms: 'Exertional symptoms',
  onsetAfterPelvicEvent: 'After surgery/injury',
  penilePainOrCurvature: 'Pain or curvature',
};

export function receiptLabel(step: IntakeStep): string {
  return RECEIPT_LABEL[step.id] ?? step.prompt;
}

export function receiptValue(step: IntakeStep, answers: Partial<IntakeAnswers>): string {
  const value = answers[step.id];
  if (value === undefined || value === null) return 'Skipped';
  if (step.kind === 'boolean') return value ? 'Yes' : 'No';
  if (step.kind === 'choice') {
    return step.options.find((o) => o.value === value)?.label ?? String(value);
  }
  return String(value);
}

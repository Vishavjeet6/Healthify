import type { StepId } from './steps';

/**
 * Purely additive grouping over INTAKE_STEPS (see steps.ts) for the
 * regrouped-onboarding redesign — chapters answer 3-9 questions on
 * one screen instead of the old one-question-per-screen flow. Never
 * changes which fields exist, their `skip` predicates, or scoring:
 * those stay in steps.ts / redFlags.ts / variant.ts, untouched.
 */
export type IntakeChapter = {
  id: string;
  number: number;
  title: string;
  blurb: string;
  stepIds: StepId[];
};

export const INTAKE_CHAPTERS: IntakeChapter[] = [
  {
    id: 'basics',
    number: 1,
    title: 'The basics',
    blurb: 'Age, build, whether you smoke, how active you are',
    stepIds: ['age', 'bmi', 'smoker', 'sedentary'],
  },
  {
    id: 'pattern',
    number: 2,
    title: 'The pattern',
    blurb: 'When it started, and whether it changes by situation',
    stepIds: ['onset', 'situational', 'morningErections'],
  },
  {
    id: 'head',
    number: 3,
    title: 'Head and life',
    blurb: 'Anxiety, and anything stressful lately',
    stepIds: ['selfReportedAnxiety', 'recentLifeStressor'],
  },
  {
    id: 'history',
    number: 4,
    title: 'Health history',
    blurb: 'Blood pressure, diabetes, cholesterol, heart',
    stepIds: [
      'diagnosedHypertension',
      'diagnosedDiabetes',
      'diabetesTreated',
      'diagnosedHighCholesterol',
      'diagnosedCardiovascularDisease',
      'cardiovascularDiseaseTreated',
      'exertionalSymptoms',
      'onsetAfterPelvicEvent',
      'penilePainOrCurvature',
    ],
  },
];

/** Chapter 5 in the map screen — not part of this module's flow; it's the existing /assessment route. */
export const BASELINE_CHAPTER = {
  number: 5,
  title: 'Your baseline score',
  blurb: 'The standard 5-question index, repeated every 4 weeks',
};

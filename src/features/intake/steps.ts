import type { IntakeAnswers } from './types';

export type StepId = keyof IntakeAnswers;

type BaseStep = {
  id: StepId;
  prompt: string;
  /** Skip this step given answers-so-far (used for conditional follow-ups). */
  skip?: (a: Partial<IntakeAnswers>) => boolean;
};

export type NumberStep = BaseStep & { kind: 'number'; placeholder: string; optional?: boolean };
export type BooleanStep = BaseStep & { kind: 'boolean' };
export type ChoiceStep = BaseStep & { kind: 'choice'; options: { value: string; label: string }[] };
export type BmiStep = BaseStep & { kind: 'bmi' };

export type IntakeStep = NumberStep | BooleanStep | ChoiceStep | BmiStep;

export const INTAKE_STEPS: IntakeStep[] = [
  { id: 'age', kind: 'number', prompt: 'What is your age?', placeholder: 'Age in years' },
  { id: 'bmi', kind: 'bmi', prompt: 'What is your BMI?' },
  { id: 'smoker', kind: 'boolean', prompt: 'Do you currently smoke?' },
  {
    id: 'sedentary',
    kind: 'boolean',
    prompt: 'Would you describe your routine as mostly sedentary — little regular exercise?',
  },
  {
    id: 'onset',
    kind: 'choice',
    prompt: 'Did this start gradually, or fairly suddenly?',
    options: [
      { value: 'gradual', label: 'Gradually, over time' },
      { value: 'sudden', label: 'Fairly suddenly' },
      { value: 'unsure', label: "I'm not sure" },
    ],
  },
  {
    id: 'situational',
    kind: 'boolean',
    prompt: 'Does it vary by situation — for example, fine alone but not with a partner, or with some partners but not others?',
  },
  {
    id: 'morningErections',
    kind: 'choice',
    prompt: 'How would you describe your morning or nighttime erections?',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'reduced', label: 'Reduced' },
      { value: 'absent', label: 'Rarely or never' },
      { value: 'unsure', label: "I don't notice / not sure" },
    ],
  },
  { id: 'selfReportedAnxiety', kind: 'boolean', prompt: 'Would you say anxiety plays a role for you?' },
  {
    id: 'recentLifeStressor',
    kind: 'boolean',
    prompt: 'Has anything notably stressful happened recently — work, relationship, health, or otherwise?',
  },
  { id: 'diagnosedHypertension', kind: 'boolean', prompt: 'Have you been diagnosed with high blood pressure?' },
  { id: 'diagnosedDiabetes', kind: 'boolean', prompt: 'Have you been diagnosed with diabetes?' },
  {
    id: 'diabetesTreated',
    kind: 'boolean',
    prompt: 'Is that diabetes currently being treated or managed?',
    skip: (a) => !a.diagnosedDiabetes,
  },
  {
    id: 'diagnosedHighCholesterol',
    kind: 'boolean',
    prompt: 'Have you been diagnosed with high cholesterol?',
  },
  {
    id: 'diagnosedCardiovascularDisease',
    kind: 'boolean',
    prompt: 'Have you been diagnosed with any heart or cardiovascular condition?',
  },
  {
    id: 'cardiovascularDiseaseTreated',
    kind: 'boolean',
    prompt: 'Is that condition currently being treated or managed?',
    skip: (a) => !a.diagnosedCardiovascularDisease,
  },
  {
    id: 'exertionalSymptoms',
    kind: 'boolean',
    prompt: 'Do you get chest pain, tightness, or unusual breathlessness during physical exertion?',
  },
  {
    id: 'onsetAfterPelvicEvent',
    kind: 'boolean',
    prompt: 'Did this start after pelvic surgery, an injury, or radiotherapy?',
  },
  {
    id: 'penilePainOrCurvature',
    kind: 'boolean',
    prompt: 'Any pain, or a new noticeable curve, involved?',
  },
];

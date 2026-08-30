import type { IntakeAnswers } from './types';
import type { ProgramVariant } from '../../db/queries/profile';

export type VariantResult = {
  variant: ProgramVariant;
  vascularScore: number;
  psychogenicScore: number;
  reasoning: string;
};

/**
 * A decision table, not a model — see IMPLEMENTATION_PLAN.md "Intake and
 * program variant routing". Scores both leanings; returns 'mixed' when
 * they land within one point of each other. The variant changes block
 * *weighting* in weeks 2-4 content, never program availability.
 */
export function computeVariant(answers: IntakeAnswers): VariantResult {
  let vascular = 0;
  let psychogenic = 0;

  if (answers.age > 45) vascular += 1;
  if (answers.bmi != null && answers.bmi >= 30) vascular += 1;
  if (answers.smoker) vascular += 1;
  if (answers.sedentary) vascular += 1;
  if (answers.onset === 'gradual') vascular += 1;
  if (answers.morningErections === 'reduced' || answers.morningErections === 'absent') vascular += 1;
  if (answers.diagnosedHypertension) vascular += 1;
  if (answers.diagnosedDiabetes) vascular += 1;
  if (answers.diagnosedHighCholesterol) vascular += 1;

  if (answers.onset === 'sudden') psychogenic += 1;
  if (answers.situational) psychogenic += 1;
  if (answers.morningErections === 'normal') psychogenic += 1;
  if (answers.selfReportedAnxiety) psychogenic += 1;
  if (answers.age < 40) psychogenic += 1;
  if (answers.recentLifeStressor) psychogenic += 1;

  const diff = vascular - psychogenic;
  let variant: ProgramVariant;
  if (Math.abs(diff) <= 1) {
    variant = 'mixed';
  } else if (diff > 1) {
    variant = 'vascular';
  } else {
    variant = 'psychogenic';
  }

  const reasoning =
    variant === 'mixed'
      ? "Your answers point to a mix of physical and situational factors, so your program balances both threads evenly."
      : variant === 'vascular'
        ? 'Your answers lean toward physical and lifestyle factors, so your program puts more weight on movement and blood-flow work.'
        : 'Your answers lean toward situational and anxiety-linked factors, so your program puts more weight on the mental-performance thread.';

  return { variant, vascularScore: vascular, psychogenicScore: psychogenic, reasoning };
}

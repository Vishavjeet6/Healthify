import type { IntakeAnswers } from './types';

export type RedFlagResult = {
  flagged: boolean;
  reasons: string[]; // internal ids, for analytics only — never shown verbatim to the user
};

/**
 * Conservative by design. See content-authoring/CLAIMS.md "redflags-*"
 * and IMPLEMENTATION_PLAN.md "Red-flag check". This function decides
 * ONLY whether to show the plain "worth getting checked" screen — it
 * never blocks, books, refers, or names a diagnosis. [CLAIM]
 */
export function checkRedFlags(answers: IntakeAnswers): RedFlagResult {
  const reasons: string[] = [];

  if (answers.morningErections === 'absent' && answers.onset === 'gradual') {
    reasons.push('redflags-absent-morning-erections-gradual');
  }
  if (answers.exertionalSymptoms) {
    reasons.push('redflags-exertional-symptoms');
  }
  if (answers.diagnosedCardiovascularDisease && !answers.cardiovascularDiseaseTreated) {
    reasons.push('redflags-untreated-cardiovascular-disease');
  }
  if (answers.diagnosedDiabetes && !answers.diabetesTreated) {
    reasons.push('redflags-untreated-diabetes');
  }
  if (answers.onsetAfterPelvicEvent) {
    reasons.push('redflags-onset-after-pelvic-event');
  }
  if (answers.penilePainOrCurvature) {
    reasons.push('redflags-penile-pain-or-curvature');
  }
  if (answers.age < 40 && answers.morningErections === 'absent' && answers.onset === 'gradual') {
    reasons.push('redflags-severe-under-40');
  }

  return { flagged: reasons.length > 0, reasons };
}

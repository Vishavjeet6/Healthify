/**
 * IIEF-5 repeats every 4 weeks (28 days), counted from the number of
 * assessments already taken (baseline counts as the first). Never more
 * often — see IMPLEMENTATION_PLAN.md feature 3.
 */
export function nextAssessmentDay(assessmentsTaken: number): number {
  return assessmentsTaken * 28 + 1;
}

export function isAssessmentDue(assessmentsTaken: number, currentProgramDay: number): boolean {
  return currentProgramDay >= nextAssessmentDay(assessmentsTaken);
}

/**
 * [CLAIM] pf-hypertonic-gate — see content-authoring/CLAIMS.md.
 * Unreviewed. This is the single highest-priority item for clinical
 * sign-off before shipping the trainer.
 *
 * An already over-tight (hypertonic) pelvic floor can present with
 * symptoms that look similar to weakness, but strengthening work can
 * worsen pain and function for that presentation. This screen exists
 * to route those users to relaxation/down-training instead of the
 * default strengthening protocol — it runs once, before the first
 * timed set, and again if the user's answers change.
 */
export type HypertonicScreenAnswers = {
  pelvicOrPerinealPain: boolean;
  urinaryUrgencyOrHesitancy: boolean;
  painWithSitting: boolean;
};

export function shouldRouteToDownTraining(answers: HypertonicScreenAnswers): boolean {
  return answers.pelvicOrPerinealPain || answers.urinaryUrgencyOrHesitancy || answers.painWithSitting;
}

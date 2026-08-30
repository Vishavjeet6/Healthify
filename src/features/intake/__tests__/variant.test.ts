import { computeVariant } from '../variant';
import type { IntakeAnswers } from '../types';

function base(overrides: Partial<IntakeAnswers> = {}): IntakeAnswers {
  return {
    age: 30,
    bmi: 24,
    smoker: false,
    sedentary: false,
    onset: 'unsure',
    situational: false,
    morningErections: 'unsure',
    selfReportedAnxiety: false,
    recentLifeStressor: false,
    diagnosedHypertension: false,
    diagnosedDiabetes: false,
    diabetesTreated: false,
    diagnosedHighCholesterol: false,
    diagnosedCardiovascularDisease: false,
    cardiovascularDiseaseTreated: false,
    exertionalSymptoms: false,
    onsetAfterPelvicEvent: false,
    penilePainOrCurvature: false,
    ...overrides,
  };
}

describe('computeVariant', () => {
  it('returns vascular when vascular signals clearly dominate', () => {
    const result = computeVariant(
      base({
        age: 55,
        bmi: 32,
        smoker: true,
        sedentary: true,
        onset: 'gradual',
        morningErections: 'absent',
        diagnosedHypertension: true,
        diagnosedDiabetes: true,
        diabetesTreated: true,
        diagnosedHighCholesterol: true,
      }),
    );
    expect(result.variant).toBe('vascular');
    expect(result.vascularScore).toBeGreaterThan(result.psychogenicScore);
  });

  it('returns psychogenic when psychogenic signals clearly dominate', () => {
    const result = computeVariant(
      base({
        age: 28,
        onset: 'sudden',
        situational: true,
        morningErections: 'normal',
        selfReportedAnxiety: true,
        recentLifeStressor: true,
      }),
    );
    expect(result.variant).toBe('psychogenic');
    expect(result.psychogenicScore).toBeGreaterThan(result.vascularScore);
  });

  it('returns mixed when scores are within one point of each other', () => {
    const result = computeVariant(base());
    expect(Math.abs(result.vascularScore - result.psychogenicScore)).toBeLessThanOrEqual(1);
    expect(result.variant).toBe('mixed');
  });

  it('treats a two-point gap as decisive, not mixed', () => {
    // age>45 (+1 vascular), morning erections absent (+1 vascular) vs nothing psychogenic => diff 2
    const result = computeVariant(base({ age: 50, morningErections: 'absent', onset: 'gradual' }));
    expect(result.vascularScore - result.psychogenicScore).toBeGreaterThan(1);
    expect(result.variant).toBe('vascular');
  });
});

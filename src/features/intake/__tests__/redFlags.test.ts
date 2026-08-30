import { checkRedFlags } from '../redFlags';
import type { IntakeAnswers } from '../types';

function base(overrides: Partial<IntakeAnswers> = {}): IntakeAnswers {
  return {
    age: 30,
    bmi: 24,
    smoker: false,
    sedentary: false,
    onset: 'unsure',
    situational: false,
    morningErections: 'normal',
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

describe('checkRedFlags', () => {
  it('does not flag a benign profile', () => {
    const result = checkRedFlags(base());
    expect(result.flagged).toBe(false);
    expect(result.reasons).toHaveLength(0);
  });

  it('flags absent morning erections with gradual onset', () => {
    const result = checkRedFlags(base({ morningErections: 'absent', onset: 'gradual' }));
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain('redflags-absent-morning-erections-gradual');
  });

  it('does not flag absent morning erections with sudden onset alone', () => {
    const result = checkRedFlags(base({ morningErections: 'absent', onset: 'sudden' }));
    expect(result.reasons).not.toContain('redflags-absent-morning-erections-gradual');
  });

  it('flags exertional symptoms', () => {
    const result = checkRedFlags(base({ exertionalSymptoms: true }));
    expect(result.flagged).toBe(true);
    expect(result.reasons).toContain('redflags-exertional-symptoms');
  });

  it('flags untreated cardiovascular disease but not treated', () => {
    const untreated = checkRedFlags(
      base({ diagnosedCardiovascularDisease: true, cardiovascularDiseaseTreated: false }),
    );
    expect(untreated.reasons).toContain('redflags-untreated-cardiovascular-disease');

    const treated = checkRedFlags(
      base({ diagnosedCardiovascularDisease: true, cardiovascularDiseaseTreated: true }),
    );
    expect(treated.reasons).not.toContain('redflags-untreated-cardiovascular-disease');
  });

  it('flags untreated diabetes but not treated', () => {
    const untreated = checkRedFlags(base({ diagnosedDiabetes: true, diabetesTreated: false }));
    expect(untreated.reasons).toContain('redflags-untreated-diabetes');

    const treated = checkRedFlags(base({ diagnosedDiabetes: true, diabetesTreated: true }));
    expect(treated.reasons).not.toContain('redflags-untreated-diabetes');
  });

  it('flags onset after a pelvic surgical/traumatic event', () => {
    const result = checkRedFlags(base({ onsetAfterPelvicEvent: true }));
    expect(result.reasons).toContain('redflags-onset-after-pelvic-event');
  });

  it('flags penile pain or curvature', () => {
    const result = checkRedFlags(base({ penilePainOrCurvature: true }));
    expect(result.reasons).toContain('redflags-penile-pain-or-curvature');
  });

  it('flags severe presentation under 40', () => {
    const result = checkRedFlags(
      base({ age: 25, morningErections: 'absent', onset: 'gradual' }),
    );
    expect(result.reasons).toContain('redflags-severe-under-40');
  });

  it('does not flag severe presentation at 40 or older', () => {
    const result = checkRedFlags(
      base({ age: 40, morningErections: 'absent', onset: 'gradual' }),
    );
    expect(result.reasons).not.toContain('redflags-severe-under-40');
  });
});

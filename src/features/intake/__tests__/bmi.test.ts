import { bmiFromMetric, bmiFromStandard } from '../bmi';

describe('bmiFromMetric', () => {
  it('computes kg/m^2 rounded to 1 decimal', () => {
    expect(bmiFromMetric(180, 80)).toBeCloseTo(24.7, 1);
  });

  it('returns null for missing or non-positive inputs', () => {
    expect(bmiFromMetric(0, 80)).toBeNull();
    expect(bmiFromMetric(180, 0)).toBeNull();
    expect(bmiFromMetric(NaN, 80)).toBeNull();
  });
});

describe('bmiFromStandard', () => {
  it('computes 703 * lb / in^2 rounded to 1 decimal', () => {
    expect(bmiFromStandard(5, 11, 176)).toBeCloseTo(24.5, 1);
  });

  it('returns null for missing or non-positive inputs', () => {
    expect(bmiFromStandard(0, 0, 176)).toBeNull();
    expect(bmiFromStandard(5, 11, 0)).toBeNull();
  });
});

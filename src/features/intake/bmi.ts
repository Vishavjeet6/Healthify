/** BMI = kg / m^2, rounded to 1 decimal (the usual clinical convention). */
export function bmiFromMetric(heightCm: number, weightKg: number): number | null {
  if (!(heightCm > 0) || !(weightKg > 0)) return null;
  const meters = heightCm / 100;
  return round1(weightKg / (meters * meters));
}

/** BMI = 703 * lb / in^2 — the standard US clinical conversion. */
export function bmiFromStandard(heightFt: number, heightIn: number, weightLb: number): number | null {
  const totalInches = heightFt * 12 + heightIn;
  if (!(totalInches > 0) || !(weightLb > 0)) return null;
  return round1((703 * weightLb) / (totalInches * totalInches));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

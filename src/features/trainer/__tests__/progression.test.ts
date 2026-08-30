import { nextLevel, shouldSuggestAdvance } from '../progression';
import type { PelvicFloorProtocol } from '../../../content/schema';
import type { TrainerRun } from '../../../db/queries/trainerRuns';

const protocol: PelvicFloorProtocol = {
  id: 'pelvic-floor',
  name: 'Pelvic floor training',
  levels: [
    { level: 1, label: 'L1', holdS: 3, restS: 6, reps: 8, sets: 2, advanceAfterRuns: 3, advanceMaxDifficulty: 3 },
    { level: 2, label: 'L2', holdS: 5, restS: 8, reps: 10, sets: 2, advanceAfterRuns: 3, advanceMaxDifficulty: 3 },
    { level: 3, label: 'L3', holdS: 8, restS: 10, reps: 10, sets: 3, advanceAfterRuns: 3, advanceMaxDifficulty: 3 },
  ],
  downTraining: { label: 'Relax', description: '', holdS: 3, restS: 12, reps: 6, sets: 2 },
};

function run(level: number, difficulty: number | null): TrainerRun {
  return {
    id: Math.random().toString(),
    protocolId: 'pelvic-floor',
    level,
    completedAt: new Date().toISOString(),
    sets: 2,
    reps: 8,
    holdS: 3,
    restS: 6,
    perceivedDifficulty: difficulty,
  };
}

describe('shouldSuggestAdvance', () => {
  it('does not suggest advancing with too few runs at the level', () => {
    const runs = [run(1, 2), run(1, 2)]; // needs 3
    expect(shouldSuggestAdvance(protocol, 1, runs)).toBe(false);
  });

  it('suggests advancing when the last N runs are all easy enough', () => {
    const runs = [run(1, 2), run(1, 3), run(1, 1)];
    expect(shouldSuggestAdvance(protocol, 1, runs)).toBe(true);
  });

  it('does not suggest advancing if any of the last N runs was too hard', () => {
    const runs = [run(1, 2), run(1, 5), run(1, 1)];
    expect(shouldSuggestAdvance(protocol, 1, runs)).toBe(false);
  });

  it('does not count runs with an unrated (null) difficulty', () => {
    const runs = [run(1, 2), run(1, null), run(1, 2)];
    expect(shouldSuggestAdvance(protocol, 1, runs)).toBe(false);
  });

  it('ignores runs at other levels', () => {
    const runs = [run(2, 1), run(2, 1), run(2, 1), run(1, 2), run(1, 2)];
    expect(shouldSuggestAdvance(protocol, 1, runs)).toBe(false);
  });

  it('returns false for an unknown level', () => {
    expect(shouldSuggestAdvance(protocol, 99, [])).toBe(false);
  });
});

describe('nextLevel', () => {
  it('returns the next level in sequence', () => {
    expect(nextLevel(protocol, 1)).toBe(2);
    expect(nextLevel(protocol, 2)).toBe(3);
  });

  it('returns null at the top level', () => {
    expect(nextLevel(protocol, 3)).toBeNull();
  });

  it('returns null for an unknown level', () => {
    expect(nextLevel(protocol, 99)).toBeNull();
  });
});

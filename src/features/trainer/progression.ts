import type { PelvicFloorProtocol } from '../../content/schema';
import type { TrainerRun } from '../../db/queries/trainerRuns';

/**
 * Suggests (never forces) advancing to the next level: the last
 * `advanceAfterRuns` runs at the current level all rated perceived
 * difficulty <= `advanceMaxDifficulty`. Runs with a null difficulty
 * (user skipped the rating) don't count toward the streak.
 */
export function shouldSuggestAdvance(
  protocol: PelvicFloorProtocol,
  currentLevel: number,
  recentRuns: TrainerRun[], // must be pre-filtered to this protocol, most-recent-first
): boolean {
  const levelDef = protocol.levels.find((l) => l.level === currentLevel);
  if (!levelDef) return false;

  const runsAtLevel = recentRuns.filter((r) => r.level === currentLevel);
  if (runsAtLevel.length < levelDef.advanceAfterRuns) return false;

  const lastN = runsAtLevel.slice(0, levelDef.advanceAfterRuns);
  return lastN.every(
    (r) => r.perceivedDifficulty != null && r.perceivedDifficulty <= levelDef.advanceMaxDifficulty,
  );
}

export function nextLevel(protocol: PelvicFloorProtocol, currentLevel: number): number | null {
  const levels = protocol.levels.map((l) => l.level).sort((a, b) => a - b);
  const idx = levels.indexOf(currentLevel);
  if (idx === -1 || idx === levels.length - 1) return null;
  return levels[idx + 1];
}

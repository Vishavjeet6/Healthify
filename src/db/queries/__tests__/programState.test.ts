import { computeDayCompletion, type ProgramState } from '../programState';

const empty: ProgramState = {
  startedAt: null,
  currentDay: 1,
  lastCompletedDate: null,
  streakCount: 0,
  longestStreak: 0,
};

describe('computeDayCompletion', () => {
  it('starts the streak at 1 on the first completion', () => {
    const next = computeDayCompletion(empty, '2026-08-01');
    expect(next.currentDay).toBe(2);
    expect(next.streakCount).toBe(1);
    expect(next.longestStreak).toBe(1);
    expect(next.startedAt).not.toBeNull();
  });

  it('extends the streak on a consecutive local day', () => {
    const day1 = computeDayCompletion(empty, '2026-08-01');
    const day2 = computeDayCompletion(day1, '2026-08-02');
    const day3 = computeDayCompletion(day2, '2026-08-03');
    expect(day3.streakCount).toBe(3);
    expect(day3.longestStreak).toBe(3);
    expect(day3.currentDay).toBe(4);
  });

  it('resets the streak but keeps program position after a missed day', () => {
    const day1 = computeDayCompletion(empty, '2026-08-01');
    const day2 = computeDayCompletion(day1, '2026-08-02');
    // skip 08-03
    const day4 = computeDayCompletion(day2, '2026-08-04');
    expect(day4.streakCount).toBe(1);
    expect(day4.longestStreak).toBe(2); // preserved from before the gap
    expect(day4.currentDay).toBe(4); // program position still advances
  });

  it('advances currentDay for a second session on the same local date, without double-counting the streak', () => {
    // Two different sessions completed in one sitting: the program
    // should move forward by two days, but the streak (a per-calendar-
    // day count) must not increment twice for one date.
    const day1 = computeDayCompletion(empty, '2026-08-01');
    const same = computeDayCompletion(day1, '2026-08-01');
    expect(same.currentDay).toBe(3);
    expect(same.streakCount).toBe(1);
    expect(same.longestStreak).toBe(1);
  });

  it('idempotency against replaying the identical session is the caller\'s job, not this function\'s', () => {
    // computeDayCompletion always advances when called — session/[id].tsx
    // guards against calling it twice for the same session via
    // isSessionCompleted before recording. Documented here so the
    // contract doesn't silently drift back to a same-date no-op.
    const day1 = computeDayCompletion(empty, '2026-08-01');
    expect(computeDayCompletion(day1, '2026-08-01').currentDay).toBe(day1.currentDay + 1);
  });

  it('handles a month/timezone-adjacent rollover as consecutive', () => {
    const jan31 = computeDayCompletion(empty, '2026-01-31');
    const feb1 = computeDayCompletion(jan31, '2026-02-01');
    expect(feb1.streakCount).toBe(2);
  });

  it('does not extend the streak across a leap-day-adjacent 2-day gap', () => {
    const feb27 = computeDayCompletion(empty, '2026-02-27');
    const mar1 = computeDayCompletion(feb27, '2026-03-01'); // 2026 is not a leap year, gap of 2 days
    expect(mar1.streakCount).toBe(1);
  });
});

import { loadProgramContent, TOTAL_PROGRAM_DAYS } from '../loader';

describe('loadProgramContent (real authored content)', () => {
  it('loads all 84 program days with no gaps or duplicates', () => {
    const { sessionsByDay } = loadProgramContent();
    expect(sessionsByDay.size).toBe(TOTAL_PROGRAM_DAYS);
    for (let day = 1; day <= TOTAL_PROGRAM_DAYS; day++) {
      expect(sessionsByDay.has(day)).toBe(true);
    }
  });

  it('marks week 1 sessions as produced and week 5+ as stubs', () => {
    const { sessionsByDay } = loadProgramContent();
    expect(sessionsByDay.get(1)?.status).toBe('produced');
    expect(sessionsByDay.get(7)?.status).toBe('produced');
    expect(sessionsByDay.get(29)?.status).toBe('stub'); // week 5, day 1
    expect(sessionsByDay.get(84)?.status).toBe('stub');
  });

  it('loads the pelvic-floor protocol referenced by content', () => {
    const { protocols } = loadProgramContent();
    expect(protocols.has('pelvic-floor')).toBe(true);
    expect(protocols.get('pelvic-floor')!.levels.length).toBeGreaterThan(0);
  });

  it('loads at least the two MVP-required education pieces', () => {
    const { education } = loadProgramContent();
    expect(education.length).toBeGreaterThanOrEqual(2);
  });
});

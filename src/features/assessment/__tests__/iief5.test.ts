import { scoreIief5, severityForScore } from '../iief5';

describe('severityForScore boundaries', () => {
  it.each([
    [25, 'none'],
    [22, 'none'],
    [21, 'mild'],
    [17, 'mild'],
    [16, 'mild-moderate'],
    [12, 'mild-moderate'],
    [11, 'moderate'],
    [8, 'moderate'],
    [7, 'severe'],
    [5, 'severe'],
  ] as const)('scores %i as %s', (score, expected) => {
    expect(severityForScore(score)).toBe(expected);
  });
});

describe('scoreIief5', () => {
  it('sums five answers correctly', () => {
    expect(scoreIief5([5, 5, 5, 5, 5]).total).toBe(25);
    expect(scoreIief5([1, 1, 1, 1, 1]).total).toBe(5);
  });

  it('rejects the wrong number of answers', () => {
    expect(() => scoreIief5([1, 2, 3])).toThrow();
  });

  it('rejects out-of-range answers', () => {
    expect(() => scoreIief5([1, 2, 3, 4, 6])).toThrow();
    expect(() => scoreIief5([0, 2, 3, 4, 5])).toThrow();
  });
});

import { ContentValidationError, validateEducationPiece, validateProtocol, validateSession } from '../schema';

const validSession = {
  id: 'w01-d01',
  week: 1,
  day: 1,
  title: 'Test',
  intent: 'Testing',
  estimatedMinutes: 5,
  status: 'produced',
  blocks: [{ kind: 'read', id: 'b1', body: 'hello' }],
};

describe('validateSession', () => {
  it('accepts a well-formed session', () => {
    expect(() => validateSession('fixture.json', validSession)).not.toThrow();
  });

  it('names the missing field and the file', () => {
    const { title, ...broken } = validSession;
    try {
      validateSession('fixture.json', broken);
      fail('expected a throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ContentValidationError);
      expect((e as Error).message).toContain('fixture.json');
      expect((e as Error).message).toContain('title');
    }
  });

  it('rejects an invalid status value', () => {
    expect(() =>
      validateSession('fixture.json', { ...validSession, status: 'nonsense' }),
    ).toThrow(/status/);
  });

  it('rejects an unknown block kind and names the block index', () => {
    expect(() =>
      validateSession('fixture.json', {
        ...validSession,
        blocks: [{ kind: 'sing-a-song', id: 'b1' }],
      }),
    ).toThrow(/blocks\[0\]/);
  });

  it('rejects a pelvic block missing protocolId', () => {
    expect(() =>
      validateSession('fixture.json', {
        ...validSession,
        blocks: [{ kind: 'pelvic', id: 'b1', level: 1 }],
      }),
    ).toThrow(/protocolId/);
  });

  it('rejects blocks that is not an array', () => {
    expect(() =>
      validateSession('fixture.json', { ...validSession, blocks: 'not-an-array' }),
    ).toThrow(/array/);
  });
});

describe('validateProtocol', () => {
  const validProtocol = {
    id: 'p1',
    name: 'Test protocol',
    levels: [
      { level: 1, label: 'L1', holdS: 3, restS: 6, reps: 8, sets: 2, advanceAfterRuns: 3, advanceMaxDifficulty: 3 },
    ],
    downTraining: { label: 'Relax', description: '', holdS: 3, restS: 12, reps: 6, sets: 2 },
  };

  it('accepts a well-formed protocol', () => {
    expect(() => validateProtocol('fixture.json', validProtocol)).not.toThrow();
  });

  it('rejects a level missing a required numeric field', () => {
    const broken = {
      ...validProtocol,
      levels: [{ level: 1, label: 'L1', holdS: 3, restS: 6, reps: 8, sets: 2 }],
    };
    expect(() => validateProtocol('fixture.json', broken)).toThrow(/advanceAfterRuns/);
  });
});

describe('validateEducationPiece', () => {
  it('accepts a well-formed piece', () => {
    expect(() =>
      validateEducationPiece('fixture.json', {
        slug: 's',
        title: 'T',
        estimatedMinutes: 3,
        body: 'B',
      }),
    ).not.toThrow();
  });

  it('rejects a piece missing a body', () => {
    expect(() =>
      validateEducationPiece('fixture.json', { slug: 's', title: 'T', estimatedMinutes: 3 }),
    ).toThrow(/body/);
  });
});

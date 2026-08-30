/**
 * Content is data, not code (IMPLEMENTATION_PLAN.md, Architecture rule 3).
 * Writing a new week must never require touching a component.
 */

export type AudioTrack = { trackId: string; durationS: number };

/** Every block may optionally carry a track. Unused in the MVP; wired for later. */
type Audio = { audio?: AudioTrack };

export type Block =
  | ({ kind: 'read'; id: string; body: string; claims?: string[] } & Audio)
  | ({
      kind: 'breathing';
      id: string;
      pattern: { inhale: number; hold: number; exhale: number; holdOut: number };
      cycles: number;
      label: string;
    } & Audio)
  | ({ kind: 'pelvic'; id: string; protocolId: string; level: number } & Audio)
  | ({ kind: 'log'; id: string; fields: ('sleep' | 'alcohol' | 'morningErection')[] } & Audio)
  | ({ kind: 'reflect'; id: string; prompt: string; storeKey: string } & Audio);

export type ProgramVariant = 'vascular' | 'psychogenic';

export type Session = {
  id: string; // 'w01-d03'
  week: number;
  day: number; // 1..7 within week
  title: string;
  intent: string;
  estimatedMinutes: number;
  status: 'produced' | 'stub';
  variants?: ProgramVariant[]; // omit = shown to all
  blocks: Block[];
};

export type ProtocolLevel = {
  level: number;
  label: string;
  holdS: number;
  restS: number;
  reps: number;
  sets: number;
  /** N runs at this level with perceivedDifficulty <= this, to suggest advancing. */
  advanceAfterRuns: number;
  advanceMaxDifficulty: number;
};

export type PelvicFloorProtocol = {
  id: string;
  name: string;
  levels: ProtocolLevel[];
  downTraining: {
    label: string;
    description: string;
    holdS: number;
    restS: number;
    reps: number;
    sets: number;
  };
};

export type EducationPiece = {
  slug: string;
  title: string;
  estimatedMinutes: number;
  body: string;
  claims?: string[];
};

// --- Validation -------------------------------------------------------

class ContentValidationError extends Error {
  constructor(file: string, message: string) {
    super(`[content:${file}] ${message}`);
    this.name = 'ContentValidationError';
  }
}

function assertField(file: string, obj: any, field: string, type: string): void {
  const value = obj?.[field];
  if (value === undefined || value === null) {
    throw new ContentValidationError(file, `missing required field "${field}"`);
  }
  if (type === 'array') {
    if (!Array.isArray(value)) {
      throw new ContentValidationError(file, `field "${field}" must be an array, got ${typeof value}`);
    }
    return;
  }
  if (typeof value !== type) {
    throw new ContentValidationError(file, `field "${field}" must be ${type}, got ${typeof value}`);
  }
}

const VALID_BLOCK_KINDS = ['read', 'breathing', 'pelvic', 'log', 'reflect'];

function validateBlock(file: string, block: any, index: number): void {
  const path = `blocks[${index}]`;
  if (!VALID_BLOCK_KINDS.includes(block?.kind)) {
    throw new ContentValidationError(
      file,
      `${path}.kind must be one of ${VALID_BLOCK_KINDS.join(', ')}, got "${block?.kind}"`,
    );
  }
  assertField(`${file}:${path}`, block, 'id', 'string');
  switch (block.kind) {
    case 'read':
      assertField(`${file}:${path}`, block, 'body', 'string');
      break;
    case 'breathing':
      assertField(`${file}:${path}`, block, 'pattern', 'object');
      assertField(`${file}:${path}`, block, 'cycles', 'number');
      assertField(`${file}:${path}`, block, 'label', 'string');
      break;
    case 'pelvic':
      assertField(`${file}:${path}`, block, 'protocolId', 'string');
      assertField(`${file}:${path}`, block, 'level', 'number');
      break;
    case 'log':
      assertField(`${file}:${path}`, block, 'fields', 'array');
      break;
    case 'reflect':
      assertField(`${file}:${path}`, block, 'prompt', 'string');
      assertField(`${file}:${path}`, block, 'storeKey', 'string');
      break;
  }
}

export function validateSession(file: string, raw: any): Session {
  assertField(file, raw, 'id', 'string');
  assertField(file, raw, 'week', 'number');
  assertField(file, raw, 'day', 'number');
  assertField(file, raw, 'title', 'string');
  assertField(file, raw, 'intent', 'string');
  assertField(file, raw, 'estimatedMinutes', 'number');
  assertField(file, raw, 'status', 'string');
  if (raw.status !== 'produced' && raw.status !== 'stub') {
    throw new ContentValidationError(file, `status must be "produced" or "stub", got "${raw.status}"`);
  }
  assertField(file, raw, 'blocks', 'array');
  raw.blocks.forEach((b: any, i: number) => validateBlock(file, b, i));
  return raw as Session;
}

export function validateProtocol(file: string, raw: any): PelvicFloorProtocol {
  assertField(file, raw, 'id', 'string');
  assertField(file, raw, 'name', 'string');
  assertField(file, raw, 'levels', 'array');
  raw.levels.forEach((level: any, i: number) => {
    const path = `levels[${i}]`;
    assertField(`${file}:${path}`, level, 'level', 'number');
    assertField(`${file}:${path}`, level, 'label', 'string');
    assertField(`${file}:${path}`, level, 'holdS', 'number');
    assertField(`${file}:${path}`, level, 'restS', 'number');
    assertField(`${file}:${path}`, level, 'reps', 'number');
    assertField(`${file}:${path}`, level, 'sets', 'number');
    assertField(`${file}:${path}`, level, 'advanceAfterRuns', 'number');
    assertField(`${file}:${path}`, level, 'advanceMaxDifficulty', 'number');
  });
  assertField(file, raw, 'downTraining', 'object');
  return raw as PelvicFloorProtocol;
}

export function validateEducationPiece(file: string, raw: any): EducationPiece {
  assertField(file, raw, 'slug', 'string');
  assertField(file, raw, 'title', 'string');
  assertField(file, raw, 'estimatedMinutes', 'number');
  assertField(file, raw, 'body', 'string');
  return raw as EducationPiece;
}

export { ContentValidationError };

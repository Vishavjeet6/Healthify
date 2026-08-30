import {
  ContentValidationError,
  EducationPiece,
  PelvicFloorProtocol,
  Session,
  validateEducationPiece,
  validateProtocol,
  validateSession,
} from './schema';

// Metro's require() needs static, literal paths — this list is that
// literal enumeration. Adding week 13 means adding a line here.
const weekModules: Record<string, any> = {
  'week-01.json': require('./program/week-01.json'),
  'week-02.json': require('./program/week-02.json'),
  'week-03.json': require('./program/week-03.json'),
  'week-04.json': require('./program/week-04.json'),
  'week-05.json': require('./program/week-05.json'),
  'week-06.json': require('./program/week-06.json'),
  'week-07.json': require('./program/week-07.json'),
  'week-08.json': require('./program/week-08.json'),
  'week-09.json': require('./program/week-09.json'),
  'week-10.json': require('./program/week-10.json'),
  'week-11.json': require('./program/week-11.json'),
  'week-12.json': require('./program/week-12.json'),
};

const protocolModules: Record<string, any> = {
  'pelvic-floor.json': require('./protocols/pelvic-floor.json'),
};

const educationModules: Record<string, any> = {
  'how-erections-work.json': require('./education/how-erections-work.json'),
  'why-pelvic-floor.json': require('./education/why-pelvic-floor.json'),
};

export type ProgramContent = {
  sessionsByDay: Map<number, Session>; // keyed by absolute program day (1..84)
  sessionsById: Map<string, Session>;
  protocols: Map<string, PelvicFloorProtocol>;
  education: EducationPiece[];
};

let cached: ProgramContent | null = null;

/**
 * Loads and validates all program JSON. Throws ContentValidationError
 * naming the offending file and field on any malformed content — this
 * must fail loudly at boot, per IMPLEMENTATION_PLAN.md Work item 2.
 */
export function loadProgramContent(): ProgramContent {
  if (cached) return cached;

  const sessionsByDay = new Map<number, Session>();
  const sessionsById = new Map<string, Session>();

  for (const [file, mod] of Object.entries(weekModules)) {
    if (!mod || !Array.isArray(mod.sessions)) {
      throw new ContentValidationError(file, 'expected top-level "sessions" array');
    }
    for (const raw of mod.sessions) {
      const session = validateSession(file, raw);
      const absoluteDay = (session.week - 1) * 7 + session.day;
      if (sessionsByDay.has(absoluteDay)) {
        throw new ContentValidationError(
          file,
          `duplicate program day ${absoluteDay} (week ${session.week} day ${session.day})`,
        );
      }
      sessionsByDay.set(absoluteDay, session);
      sessionsById.set(session.id, session);
    }
  }

  const protocols = new Map<string, PelvicFloorProtocol>();
  for (const [file, mod] of Object.entries(protocolModules)) {
    const protocol = validateProtocol(file, mod);
    protocols.set(protocol.id, protocol);
  }

  const education: EducationPiece[] = [];
  for (const [file, mod] of Object.entries(educationModules)) {
    education.push(validateEducationPiece(file, mod));
  }

  cached = { sessionsByDay, sessionsById, protocols, education };
  return cached;
}

export function getSessionForDay(day: number): Session | undefined {
  return loadProgramContent().sessionsByDay.get(day);
}

export function getSessionById(id: string): Session | undefined {
  return loadProgramContent().sessionsById.get(id);
}

/** Absolute program day (1..84) for a session, from its week/day fields. */
export function absoluteDayFor(session: Session): number {
  return (session.week - 1) * 7 + session.day;
}

export function getProtocol(id: string): PelvicFloorProtocol | undefined {
  return loadProgramContent().protocols.get(id);
}

export const TOTAL_PROGRAM_DAYS = 84;

import { getProtocol } from '../../content/loader';
import type { Block } from '../../content/schema';

const KIND_LABEL: Record<Block['kind'], string> = {
  read: 'Read',
  breathing: 'Breathing',
  pelvic: 'Pelvic set',
  log: 'Log',
  reflect: 'Reflect',
};

/** Uppercase kind label for the session player header ("BLOCK 1 · BREATHING"). */
export function blockKindLabel(kind: Block['kind']): string {
  return KIND_LABEL[kind].toUpperCase();
}

/** "Breathing 3 min" style chip for a session preview. Omits the minute count where it can't be honestly estimated (read/log/reflect have no timed structure in the schema). */
export function blockChipLabel(block: Block): string {
  if (block.kind === 'breathing') {
    const { inhale, hold, exhale, holdOut } = block.pattern;
    const totalS = block.cycles * (inhale + hold + exhale + holdOut);
    return `${KIND_LABEL.breathing} ${Math.max(1, Math.round(totalS / 60))} min`;
  }
  if (block.kind === 'pelvic') {
    const protocol = getProtocol(block.protocolId);
    const levelDef = protocol?.levels.find((l) => l.level === block.level);
    if (levelDef) {
      const totalS = levelDef.sets * levelDef.reps * (levelDef.holdS + levelDef.restS);
      return `${KIND_LABEL.pelvic} ${Math.max(1, Math.round(totalS / 60))} min`;
    }
  }
  return KIND_LABEL[block.kind];
}

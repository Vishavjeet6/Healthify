import type { Block } from '../../content/schema';
import { BreathingBlock } from './BreathingBlock';
import { LogBlock } from './LogBlock';
import { PelvicBlock } from './PelvicBlock';
import { ReadBlock } from './ReadBlock';
import { ReflectBlock } from './ReflectBlock';

export function BlockRenderer({ block, onDone }: { block: Block; onDone: () => void }) {
  switch (block.kind) {
    case 'read':
      return <ReadBlock block={block} onDone={onDone} />;
    case 'breathing':
      return <BreathingBlock block={block} onDone={onDone} />;
    case 'pelvic':
      return <PelvicBlock block={block} onDone={onDone} />;
    case 'log':
      return <LogBlock block={block} onDone={onDone} />;
    case 'reflect':
      return <ReflectBlock block={block} onDone={onDone} />;
  }
}

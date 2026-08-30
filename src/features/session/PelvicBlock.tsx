import type { Block } from '../../content/schema';
import { HypertonicGateScreen } from '../trainer/HypertonicGateScreen';
import { IsolationCoachingScreen } from '../trainer/IsolationCoachingScreen';
import { PelvicRunner } from '../trainer/PelvicRunner';
import { useIsolationSeen } from '../trainer/useIsolationSeen';
import { usePelvicFloorMode } from '../trainer/usePelvicFloorMode';

type PelvicBlockType = Extract<Block, { kind: 'pelvic' }>;

/**
 * Isolation coaching and the hypertonic gate both apply here too — a
 * session's pelvic block may be a user's first-ever set just as easily
 * as the standalone trainer tab is. The gate always wins over the
 * level the week's content prescribes.
 */
export function PelvicBlock({ block, onDone }: { block: PelvicBlockType; onDone: () => void }) {
  const { mode, submitGate } = usePelvicFloorMode();
  const { seen: isolationSeen, markSeen } = useIsolationSeen();

  if (mode === 'loading' || isolationSeen === null) return null;

  if (!isolationSeen) {
    return <IsolationCoachingScreen onDone={markSeen} />;
  }

  if (mode === 'needs-gate') {
    return <HypertonicGateScreen onSubmit={(answers) => submitGate(answers)} />;
  }

  return (
    <PelvicRunner
      protocolId={block.protocolId}
      level={block.level}
      downTraining={mode === 'downtraining'}
      onFinished={onDone}
    />
  );
}

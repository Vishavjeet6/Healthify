import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { View } from 'react-native';

import { getProtocol } from '../../src/content/loader';
import { listTrainerRuns } from '../../src/db/queries/trainerRuns';
import { track } from '../../src/features/analytics';
import { HypertonicGateScreen } from '../../src/features/trainer/HypertonicGateScreen';
import { IsolationCoachingScreen } from '../../src/features/trainer/IsolationCoachingScreen';
import { PelvicRunner } from '../../src/features/trainer/PelvicRunner';
import { nextLevel, shouldSuggestAdvance } from '../../src/features/trainer/progression';
import { useIsolationSeen } from '../../src/features/trainer/useIsolationSeen';
import { usePelvicFloorMode } from '../../src/features/trainer/usePelvicFloorMode';
import { Screen } from '../../src/ui/components/Screen';

const PROTOCOL_ID = 'pelvic-floor';

export default function TrainerRun() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ demo?: string; relearn?: string; regate?: string }>();
  const { mode, level, submitGate, advanceLevel, refresh } = usePelvicFloorMode();
  const { seen: isolationSeen, markSeen } = useIsolationSeen();

  if (mode === 'loading' || isolationSeen === null) return <Screen />;

  // "Finding the muscle" from Trainer home replays this screen without
  // touching the stored isolationSeen flag — it's a re-watch, not a reset.
  if (!isolationSeen || params.relearn === '1') {
    return (
      <Screen back>
        <IsolationCoachingScreen onDone={params.relearn === '1' ? () => router.back() : markSeen} />
      </Screen>
    );
  }

  // "Relaxation mode" from Trainer home routes back through the real
  // hypertonic gate rather than bypassing it — submitGate still decides.
  if (mode === 'needs-gate' || params.regate === '1') {
    return (
      <Screen back>
        <HypertonicGateScreen onSubmit={(answers) => submitGate(answers)} />
      </Screen>
    );
  }

  return (
    <Screen back>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <PelvicRunner
          protocolId={PROTOCOL_ID}
          level={level}
          downTraining={mode === 'downtraining'}
          showDemo={params.demo !== '0'}
          onFinished={async () => {
            await track(db, 'trainer_run_finished', { level, mode });
            if (mode === 'strength') {
              const protocol = getProtocol(PROTOCOL_ID);
              const runs = await listTrainerRuns(db, PROTOCOL_ID);
              if (protocol && shouldSuggestAdvance(protocol, level, runs)) {
                const next = nextLevel(protocol, level);
                if (next) await advanceLevel(next);
              }
            }
            router.back();
          }}
        />
      </View>
    </Screen>
  );
}

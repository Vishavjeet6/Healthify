import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

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
import { spacing, type, useTheme } from '../../src/ui/theme';

const PROTOCOL_ID = 'pelvic-floor';

export default function TrainerRun() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { mode, level, submitGate, advanceLevel, refresh } = usePelvicFloorMode();
  const { seen: isolationSeen, markSeen } = useIsolationSeen();

  if (mode === 'loading' || isolationSeen === null) return <Screen />;

  if (!isolationSeen) {
    return (
      <Screen>
        <IsolationCoachingScreen onDone={markSeen} />
      </Screen>
    );
  }

  if (mode === 'needs-gate') {
    return (
      <Screen>
        <HypertonicGateScreen onSubmit={(answers) => submitGate(answers)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <PelvicRunner
          protocolId={PROTOCOL_ID}
          level={level}
          downTraining={mode === 'downtraining'}
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

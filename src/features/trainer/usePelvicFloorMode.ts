import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getSetting, setSetting } from '../../db/queries/settings';
import { shouldRouteToDownTraining, type HypertonicScreenAnswers } from './hypertonicGate';

const GATE_ANSWERED_KEY = 'pf_gate_answered';
const DOWNTRAINING_KEY = 'pf_downtraining_mode';
const LEVEL_KEY = 'pf_current_level';

export type PelvicFloorMode = 'loading' | 'needs-gate' | 'strength' | 'downtraining';

export function usePelvicFloorMode() {
  const db = useSQLiteContext();
  const [mode, setMode] = useState<PelvicFloorMode>('loading');
  const [level, setLevel] = useState(1);

  const refresh = useCallback(async () => {
    const answered = (await getSetting(db, GATE_ANSWERED_KEY)) === 'true';
    if (!answered) {
      setMode('needs-gate');
      return;
    }
    const downTraining = (await getSetting(db, DOWNTRAINING_KEY)) === 'true';
    const storedLevel = await getSetting(db, LEVEL_KEY);
    setLevel(storedLevel ? Number(storedLevel) : 1);
    setMode(downTraining ? 'downtraining' : 'strength');
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submitGate(answers: HypertonicScreenAnswers) {
    const downTraining = shouldRouteToDownTraining(answers);
    await setSetting(db, GATE_ANSWERED_KEY, 'true');
    await setSetting(db, DOWNTRAINING_KEY, downTraining ? 'true' : 'false');
    await refresh();
  }

  async function advanceLevel(newLevel: number) {
    await setSetting(db, LEVEL_KEY, String(newLevel));
    setLevel(newLevel);
  }

  return { mode, level, submitGate, advanceLevel, refresh };
}

import { useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Pressable, Text, View } from 'react-native';

import { getProtocol } from '../../content/loader';
import type { ProtocolLevel } from '../../content/schema';
import { insertTrainerRun } from '../../db/queries/trainerRuns';
import { Button } from '../../ui/components/Button';
import { ProgressRing } from '../../ui/components/ProgressRing';
import { radius, spacing, type, useTheme } from '../../ui/theme';

type Phase = 'ready' | 'contract' | 'release' | 'done';

export function PelvicRunner({
  protocolId,
  level,
  downTraining,
  onFinished,
}: {
  protocolId: string;
  level: number;
  /** If true, uses the protocol's down-training params instead of the level's. */
  downTraining?: boolean;
  onFinished?: () => void;
}) {
  const theme = useTheme();
  const db = useSQLiteContext();
  const protocol = getProtocol(protocolId);

  const levelDef: ProtocolLevel | undefined = protocol?.levels.find((l) => l.level === level);
  const params = downTraining
    ? protocol?.downTraining
    : levelDef
      ? { holdS: levelDef.holdS, restS: levelDef.restS, reps: levelDef.reps, sets: levelDef.sets }
      : undefined;

  const [phase, setPhase] = useState<Phase>('ready');
  const [setIndex, setSetIndex] = useState(0);
  const [repIndex, setRepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'ready' || phase === 'done') {
      deactivateKeepAwake();
      return;
    }
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'contract' && phase !== 'release') return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          advancePhase();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, repIndex, setIndex]);

  if (!params) {
    return (
      <View>
        <Text style={[type.body, { color: theme.textPrimary }]}>
          This protocol isn't available.
        </Text>
      </View>
    );
  }

  function start() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('contract');
    setSecondsLeft(params!.holdS);
  }

  function advancePhase() {
    if (phase === 'contract') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhase('release');
      setSecondsLeft(params!.restS);
      return;
    }
    // phase === 'release': move to next rep/set, or finish
    const isLastRep = repIndex + 1 >= params!.reps;
    const isLastSet = setIndex + 1 >= params!.sets;
    if (isLastRep && isLastSet) {
      setPhase('done');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isLastRep) {
      setSetIndex(setIndex + 1);
      setRepIndex(0);
    } else {
      setRepIndex(repIndex + 1);
    }
    setPhase('contract');
    setSecondsLeft(params!.holdS);
  }

  async function finish() {
    await insertTrainerRun(db, {
      protocolId,
      level,
      sets: params!.sets,
      reps: params!.reps,
      holdS: params!.holdS,
      restS: params!.restS,
      perceivedDifficulty: difficulty,
    });
    onFinished?.();
  }

  if (phase === 'ready') {
    return (
      <View style={{ gap: spacing.md, alignItems: 'center' }}>
        <Text style={[type.body, { color: theme.textSecondary, textAlign: 'center' }]}>
          {params.sets} sets of {params.reps}, {params.holdS}s hold / {params.restS}s rest. Haptics
          lead — you can look away.
        </Text>
        <Button theme={theme} label="Start" onPress={start} />
      </View>
    );
  }

  if (phase === 'done') {
    return (
      <View style={{ gap: spacing.lg, alignItems: 'center' }}>
        <Text style={[type.title, { color: theme.textPrimary }]}>Set complete</Text>
        <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
          How did that feel? (1 easy — 5 hard)
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[1, 2, 3, 4, 5].map((d) => (
            <Pressable
              key={d}
              onPress={() => setDifficulty(d)}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: difficulty === d ? theme.accent : theme.border,
                backgroundColor: difficulty === d ? theme.accent : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: difficulty === d ? theme.accentOn : theme.textPrimary }}>
                {d}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button theme={theme} label="Done" onPress={finish} />
      </View>
    );
  }

  const phaseDuration = (phase === 'contract' ? params.holdS : params.restS) * 1000;
  const elapsed = (phase === 'contract' ? params.holdS : params.restS) - secondsLeft;
  const progress = phaseDuration === 0 ? 0 : elapsed / (phaseDuration / 1000);

  return (
    <View style={{ alignItems: 'center', gap: spacing.lg }}>
      <ProgressRing
        progress={phase === 'contract' ? progress : 1 - progress}
        durationMs={1000}
        trackColor={theme.border}
        fillColor={phase === 'contract' ? theme.accent : theme.caution}
      >
        <Text style={[type.displayLg, { color: theme.textPrimary, fontVariant: ['tabular-nums'] }]}>
          {secondsLeft}
        </Text>
        <Text style={[type.caption, { color: theme.textTertiary }]}>
          {phase === 'contract' ? 'Squeeze' : 'Release'}
        </Text>
      </ProgressRing>
      <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
        Set {setIndex + 1} of {params.sets} · Rep {repIndex + 1} of {params.reps}
      </Text>
    </View>
  );
}

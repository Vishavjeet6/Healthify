import { useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { getProtocol } from '../../content/loader';
import type { ProtocolLevel } from '../../content/schema';
import { insertTrainerRun, listTrainerRuns } from '../../db/queries/trainerRuns';
import { Button } from '../../ui/components/Button';
import { DemoPlaceholder } from '../../ui/components/DemoPlaceholder';
import { OrbCounter } from '../../ui/components/OrbCounter';
import { radius, spacing, type, useTheme } from '../../ui/theme';
import { nextLevel } from './progression';

type Phase = 'ready' | 'contract' | 'release' | 'done';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function PelvicRunner({
  protocolId,
  level,
  downTraining,
  showDemo = true,
  onFinished,
}: {
  protocolId: string;
  level: number;
  /** If true, uses the protocol's down-training params instead of the level's. */
  downTraining?: boolean;
  /** "Start without video" — omit the demo placeholder panel entirely. */
  showDemo?: boolean;
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
  const [demoMinimized, setDemoMinimized] = useState(false);
  const [priorQualifyingRuns, setPriorQualifyingRuns] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (downTraining || !levelDef) return;
    listTrainerRuns(db, protocolId).then((runs) => {
      const atLevel = runs.filter((r) => r.level === level);
      setPriorQualifyingRuns(
        atLevel.filter((r) => r.perceivedDifficulty != null && r.perceivedDifficulty <= levelDef.advanceMaxDifficulty)
          .length,
      );
    });
  }, [db, protocolId, level, downTraining, levelDef]);

  useEffect(() => {
    if (phase === 'ready' || phase === 'done') {
      deactivateKeepAwake().catch(() => {});
      return;
    }
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake().catch(() => {});
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
      <View style={{ gap: spacing.lg, alignItems: 'center' }}>
        {showDemo && <DemoPlaceholder theme={theme} label="DEMO LOOP · SILENT" height={220} />}
        <Text style={[type.body, { color: theme.textSecondary, textAlign: 'center' }]}>
          {params.sets} sets of {params.reps}, {params.holdS}s hold / {params.restS}s rest. Haptics
          lead — you can look away.
        </Text>
        <Button theme={theme} label="Start" onPress={start} />
      </View>
    );
  }

  if (phase === 'done') {
    const nextLvl = !downTraining && levelDef && protocol ? nextLevel(protocol, level) : null;
    const nextLevelDef = nextLvl && protocol ? protocol.levels.find((l) => l.level === nextLvl) : undefined;
    const remaining =
      levelDef && nextLevelDef ? Math.max(1, levelDef.advanceAfterRuns - priorQualifyingRuns) : 0;

    return (
      <View style={{ gap: spacing.xl, alignItems: 'center', width: '100%' }}>
        <CompleteSweep color={theme.accent} tint={`${theme.accent}29`} />
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={[type.displayMd, { color: theme.textPrimary }]}>Set complete</Text>
          <Text style={[type.bodySmall, { color: theme.textSecondary }]}>
            {params.sets} sets of {params.reps} · {params.holdS}s hold
          </Text>
        </View>

        <View style={{ width: '100%', height: 1, backgroundColor: theme.border }} />

        <View style={{ width: '100%', gap: spacing.md }}>
          <Text style={[type.bodySmall, { color: theme.textPrimary, textAlign: 'center' }]}>
            How hard was that?
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((d) => (
              <Pressable
                key={d}
                onPress={() => setDifficulty(d)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: radius.pill,
                  backgroundColor: difficulty === d ? theme.accent : theme.surfaceRaised,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: difficulty === d ? theme.accentOn : theme.textSecondary,
                    fontWeight: difficulty === d ? '600' : '400',
                    fontSize: 16,
                  }}
                >
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[type.caption, { color: theme.textTertiary }]}>Easy</Text>
            <Text style={[type.caption, { color: theme.textTertiary }]}>Hard</Text>
          </View>
        </View>

        {nextLvl && nextLevelDef && remaining > 0 && (
          <View
            style={{
              width: '100%',
              backgroundColor: `${theme.accent}17`,
              borderRadius: radius.lg,
              padding: spacing.md,
            }}
          >
            <Text style={[type.bodySmall, { color: theme.textSecondary, lineHeight: 20 }]}>
              {remaining === 1 ? 'One more set' : `${remaining} more sets`} at {levelDef!.advanceMaxDifficulty} or
              below and the trainer suggests level {nextLvl} — {nextLevelDef.holdS}s holds.
            </Text>
          </View>
        )}

        <Button theme={theme} label="Done" onPress={finish} />
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', gap: spacing.xl, width: '100%' }}>
      {showDemo && (
        <DemoPlaceholder
          theme={theme}
          label="DEMO LOOP · SILENT"
          height={demoMinimized ? undefined : 220}
          minimized={demoMinimized}
          onPress={() => setDemoMinimized((m) => !m)}
        />
      )}

      <OrbCounter phase={phase} secondsLeft={secondsLeft} phaseDurationS={phase === 'contract' ? params.holdS : params.restS} theme={theme} />

      <View style={{ flexDirection: 'row', gap: spacing.xl, alignItems: 'baseline' }}>
        <Stat theme={theme} label="REP" value={`${repIndex + 1}/${params.reps}`} />
        <Stat theme={theme} label="SET" value={`${setIndex + 1}/${params.sets}`} />
      </View>
      <Text style={[type.bodySmall, { color: theme.textTertiary, textAlign: 'center' }]}>
        Haptics lead each phase — you can put the phone down.
      </Text>
    </View>
  );
}

function Stat({ theme, label, value }: { theme: ReturnType<typeof useTheme>; label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[type.mono, { color: theme.textTertiary }]}>{label}</Text>
      <Text style={[type.displayMd, { color: theme.textPrimary, fontVariant: ['tabular-nums'], marginTop: 2 }]}>
        {value}
      </Text>
    </View>
  );
}

/** The set-complete checkmark: a ring that sweeps in, then a check draws over it. */
function CompleteSweep({ color, tint }: { color: string; tint: string }) {
  const size = 108;
  const r = 48;
  const circumference = 2 * Math.PI * r;
  const sweep = useSharedValue(circumference);
  const checkLength = useSharedValue(0);

  useEffect(() => {
    sweep.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    checkLength.value = withDelay(500, withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: sweep.value }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: 24 * (1 - checkLength.value) }));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={`${color}22`} strokeWidth={2} fill="none" />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeDasharray={circumference}
        animatedProps={ringProps}
        rotation={-90}
        originX={size / 2}
        originY={size / 2}
      />
      <Circle cx={size / 2} cy={size / 2} r={r / 2} fill={tint} />
      <AnimatedPath
        d={`M${size * 0.35} ${size / 2} l${size * 0.11} ${size * 0.11} l${size * 0.19} -${size * 0.19}`}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={24}
        animatedProps={checkProps}
      />
    </Svg>
  );
}

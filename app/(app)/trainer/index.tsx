import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { getProtocol } from '../../../src/content/loader';
import { countTrainerRuns, countTrainerRunsSince } from '../../../src/db/queries/trainerRuns';
import { usePelvicFloorMode } from '../../../src/features/trainer/usePelvicFloorMode';
import { Button } from '../../../src/ui/components/Button';
import { Card } from '../../../src/ui/components/Card';
import { Screen } from '../../../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../../../src/ui/theme';

const PROTOCOL_ID = 'pelvic-floor';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function TrainerHome() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { mode, level, refresh } = usePelvicFloorMode();
  const [runsDone, setRunsDone] = useState(0);
  const [runsThisWeek, setRunsThisWeek] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refresh();
      countTrainerRuns(db).then(setRunsDone);
      countTrainerRunsSince(db, new Date(Date.now() - SEVEN_DAYS_MS).toISOString()).then(setRunsThisWeek);
    }, [db, refresh]),
  );

  const protocol = getProtocol(PROTOCOL_ID);
  const downTraining = mode === 'downtraining';
  const levelDef = protocol?.levels.find((l) => l.level === level);
  const params = downTraining ? protocol?.downTraining : levelDef;
  const minutes = params ? Math.round((params.sets * params.reps * (params.holdS + params.restS)) / 60) : null;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>Trainer</Text>
        <Text style={[type.mono, { color: theme.textTertiary }]}>FREE · NO ACCOUNT</Text>
      </View>

      <Card theme={theme} style={{ backgroundColor: theme.surfaceRaised, borderColor: 'transparent', gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: `${theme.accent}40`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: 38, height: 38, borderRadius: radius.pill, backgroundColor: theme.accent }} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[type.mono, { color: theme.textTertiary }]}>
              {downTraining ? "TODAY'S SET · RELAXATION" : `TODAY'S SET · LEVEL ${level}`}
            </Text>
            <Text style={[type.title, { color: theme.textPrimary }]}>
              {params ? `${params.sets} × ${params.reps}, ${params.holdS} second holds` : 'Loading…'}
            </Text>
            {minutes != null && (
              <Text style={[type.bodySmall, { color: theme.textTertiary }]}>About {minutes} minutes</Text>
            )}
          </View>
        </View>

        <Button theme={theme} label="Start with demo" onPress={() => router.push('/trainer/run')} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/trainer/run?demo=0')}
          style={{ alignItems: 'center', paddingVertical: 4 }}
        >
          <Text style={[type.bodySmall, { color: theme.textSecondary }]}>Start without video</Text>
        </Pressable>
      </Card>

      <View>
        <EducationRow
          theme={theme}
          title="Finding the muscle"
          meta="Watch · 1 min"
          metaColor={theme.accent}
          onPress={() => router.push('/trainer/run?relearn=1')}
        />
        <EducationRow
          theme={theme}
          title="Why pelvic floor training"
          meta="Read · 4 min"
          onPress={() => router.push('/(app)/learn/why-pelvic-floor')}
        />
        <EducationRow
          theme={theme}
          title="Relaxation mode"
          meta="If squeezing hurts"
          last
          onPress={() => router.push('/trainer/run?regate=1')}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Stat theme={theme} label="SETS DONE" value={String(runsDone)} />
        <Stat theme={theme} label="THIS WEEK" value={String(runsThisWeek)} />
        <Stat theme={theme} label="LEVEL" value={downTraining ? '—' : String(level)} accent />
      </View>
    </Screen>
  );
}

function EducationRow({
  theme,
  title,
  meta,
  metaColor,
  last,
  onPress,
}: {
  theme: ReturnType<typeof useTheme>;
  title: string;
  meta: string;
  metaColor?: string;
  last?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: last ? 1 : 0,
        borderColor: theme.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={[type.body, { color: theme.textPrimary, fontSize: 15.5 }]}>{title}</Text>
      <Text style={[type.caption, { color: metaColor ?? theme.textTertiary }]}>{meta}</Text>
    </Pressable>
  );
}

function Stat({
  theme,
  label,
  value,
  accent,
}: {
  theme: ReturnType<typeof useTheme>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card theme={theme} style={{ flex: 1, gap: 2 }}>
      <Text style={[type.mono, { color: theme.textTertiary }]}>{label}</Text>
      <Text
        style={[
          type.displayMd,
          { color: accent ? theme.accent : theme.textPrimary, fontVariant: ['tabular-nums'] },
        ]}
      >
        {value}
      </Text>
    </Card>
  );
}

import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import type { Assessment } from '../../src/db/queries/assessments';
import { listAssessments } from '../../src/db/queries/assessments';
import { countSessionCompletions } from '../../src/db/queries/sessionCompletions';
import { ensureProgramState, type ProgramState } from '../../src/db/queries/programState';
import { countTrainerRuns } from '../../src/db/queries/trainerRuns';
import { IIEF5_MCID } from '../../src/features/assessment/iief5';
import { useEntitlement } from '../../src/features/paywall/useEntitlement';
import { nextAssessmentDay } from '../../src/features/progress/nextAssessment';
import { Button } from '../../src/ui/components/Button';
import { Card } from '../../src/ui/components/Card';
import { Screen } from '../../src/ui/components/Screen';
import { TrendChart } from '../../src/ui/components/TrendChart';
import { spacing, type, useTheme } from '../../src/ui/theme';

export default function Progress() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { entitlement } = useEntitlement();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [sessionsDone, setSessionsDone] = useState(0);
  const [trainerRuns, setTrainerRuns] = useState(0);
  const [state, setState] = useState<ProgramState | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setAssessments(await listAssessments(db));
        setSessionsDone(await countSessionCompletions(db));
        setTrainerRuns(await countTrainerRuns(db));
        setState(await ensureProgramState(db));
      })();
    }, [db]),
  );

  const locked = !entitlement.active;

  return (
    <Screen>
      <Text style={[type.displayMd, { color: theme.textPrimary }]}>Progress</Text>

      <Card theme={theme}>
        <Text style={[type.caption, { color: theme.textTertiary }]}>Trainer sets completed</Text>
        <Text style={[type.displayMd, { color: theme.accent, fontVariant: ['tabular-nums'] }]}>
          {trainerRuns}
        </Text>
      </Card>

      {locked ? (
        <Card theme={theme}>
          <Text style={[type.body, { color: theme.textSecondary }]}>
            Session history, streaks, and your score trend are part of membership.
          </Text>
          <Button theme={theme} label="See membership" onPress={() => router.push('/paywall')} />
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Card theme={theme} style={{ flex: 1 }}>
              <Text style={[type.caption, { color: theme.textTertiary }]}>Sessions done</Text>
              <Text style={[type.displayMd, { color: theme.textPrimary, fontVariant: ['tabular-nums'] }]}>
                {sessionsDone}
              </Text>
            </Card>
            <Card theme={theme} style={{ flex: 1 }}>
              <Text style={[type.caption, { color: theme.textTertiary }]}>Longest streak</Text>
              <Text style={[type.displayMd, { color: theme.textPrimary, fontVariant: ['tabular-nums'] }]}>
                {state?.longestStreak ?? 0}
              </Text>
            </Card>
          </View>

          <Card theme={theme}>
            <Text style={[type.caption, { color: theme.textTertiary }]}>Score trend</Text>
            {assessments.length > 0 ? (
              <TrendChart
                points={assessments.map((a) => ({ date: a.takenAt, score: a.totalScore }))}
                mcid={IIEF5_MCID}
              />
            ) : (
              <Text style={[type.bodySmall, { color: theme.textTertiary }]}>No data yet.</Text>
            )}
            {state && (
              <Text style={[type.caption, { color: theme.textTertiary }]}>
                Next check-in unlocks on day {nextAssessmentDay(assessments.length)}.
              </Text>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}

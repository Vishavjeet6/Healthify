import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { countAssessments } from '../../src/db/queries/assessments';
import { upsertTodayLog } from '../../src/db/queries/dailyLogs';
import { ensureProgramState, type ProgramState } from '../../src/db/queries/programState';
import { getSessionForDay, TOTAL_PROGRAM_DAYS } from '../../src/content/loader';
import type { Session } from '../../src/content/schema';
import { useEntitlement } from '../../src/features/paywall/useEntitlement';
import { isAssessmentDue } from '../../src/features/progress/nextAssessment';
import { Button } from '../../src/ui/components/Button';
import { Card } from '../../src/ui/components/Card';
import { Screen } from '../../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../../src/ui/theme';

export default function Today() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { entitlement } = useEntitlement();

  const [state, setState] = useState<ProgramState | null>(null);
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [assessmentsTaken, setAssessmentsTaken] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await ensureProgramState(db);
        setState(s);
        setSession(getSessionForDay(s.currentDay));
        setAssessmentsTaken(await countAssessments(db));
      })();
    }, [db]),
  );

  if (!state) return <Screen />;

  const finished = state.currentDay > TOTAL_PROGRAM_DAYS;
  // Free tier is exactly: pelvic floor trainer, 1 IIEF-5, 2 education
  // pieces (IMPLEMENTATION_PLAN.md "Locked decisions" — Paywall). The
  // daily program itself is paid content from day 1, with no preview —
  // don't reintroduce one without updating that table.
  const locked = !entitlement.active;
  const daysIn = state.currentDay - 1;
  const dueForAssessment = isAssessmentDue(assessmentsTaken, state.currentDay);

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Text style={[type.caption, { color: theme.textTertiary }]}>Day {state.currentDay}</Text>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>
          {finished ? "You've completed the program" : session?.title ?? 'Loading…'}
        </Text>
        {!finished && session && (
          <Text style={[type.body, { color: theme.textSecondary }]}>{session.intent}</Text>
        )}
      </View>

      {!finished && (
        <Card theme={theme}>
          {locked ? (
            <View style={{ gap: spacing.md }}>
              <Text style={[type.body, { color: theme.textSecondary }]}>
                The 12-week program is part of membership. The pelvic floor trainer, your first
                check-in, and two guides are free — start there, or unlock the full program now.
              </Text>
              <Button
                theme={theme}
                label="See membership"
                onPress={() => router.push('/paywall')}
              />
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              <Text style={[type.caption, { color: theme.textTertiary }]}>
                {session?.estimatedMinutes ?? 0} min
              </Text>
              <Button
                theme={theme}
                label="Begin session"
                onPress={() => session && router.push(`/session/${session.id}`)}
              />
            </View>
          )}
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Stat theme={theme} label="Streak" value={String(state.streakCount)} />
        <Stat theme={theme} label="Days in" value={String(Math.max(daysIn, 0))} />
      </View>

      {dueForAssessment && (
        <Card theme={theme}>
          <Text style={[type.body, { color: theme.textPrimary }]}>
            Your 4-week check-in is ready.
          </Text>
          <Button
            theme={theme}
            variant="secondary"
            label={entitlement.active ? 'Take check-in' : 'Unlock check-ins'}
            onPress={() =>
              router.push(entitlement.active ? '/assessment-retake' : '/paywall')
            }
          />
        </Card>
      )}

      <QuickLog
        theme={theme}
        onLog={async (patch) => {
          await upsertTodayLog(db, patch);
        }}
      />
    </Screen>
  );
}

function Stat({
  theme,
  label,
  value,
}: {
  theme: ReturnType<typeof useTheme>;
  label: string;
  value: string;
}) {
  return (
    <Card theme={theme} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <Text style={[type.displayMd, { color: theme.accent, fontVariant: ['tabular-nums'] }]}>
        {value}
      </Text>
      <Text style={[type.caption, { color: theme.textTertiary }]}>{label}</Text>
    </Card>
  );
}

function QuickLog({
  theme,
  onLog,
}: {
  theme: ReturnType<typeof useTheme>;
  onLog: (patch: {
    morningErection?: boolean;
    sleepHours?: number;
    drinks?: number;
  }) => Promise<void>;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[type.caption, { color: theme.textTertiary }]}>Quick log</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Chip
          theme={theme}
          label="Woke up firm"
          onPress={async () => {
            await onLog({ morningErection: true });
            setSaved(true);
          }}
        />
        <Chip
          theme={theme}
          label="Not today"
          onPress={async () => {
            await onLog({ morningErection: false });
            setSaved(true);
          }}
        />
      </View>
      {saved && (
        <Text style={[type.caption, { color: theme.textTertiary }]}>Logged.</Text>
      )}
    </View>
  );
}

function Chip({
  theme,
  label,
  onPress,
}: {
  theme: ReturnType<typeof useTheme>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: radius.pill,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: pressed ? theme.surfaceRaised : theme.surface,
      })}
    >
      <Text style={[type.bodySmall, { color: theme.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

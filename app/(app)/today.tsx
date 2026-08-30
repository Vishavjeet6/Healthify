import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { countAssessments, listAssessments } from '../../src/db/queries/assessments';
import { upsertTodayLog } from '../../src/db/queries/dailyLogs';
import { ensureProgramState, type ProgramState } from '../../src/db/queries/programState';
import { getSessionForDay, TOTAL_PROGRAM_DAYS } from '../../src/content/loader';
import type { Session } from '../../src/content/schema';
import { blockChipLabel } from '../../src/features/session/blockLabel';
import { useEntitlement } from '../../src/features/paywall/useEntitlement';
import { isAssessmentDue } from '../../src/features/progress/nextAssessment';
import { Button } from '../../src/ui/components/Button';
import { Card } from '../../src/ui/components/Card';
import { DemoPlaceholder } from '../../src/ui/components/DemoPlaceholder';
import { Screen } from '../../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../../src/ui/theme';

export default function Today() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { entitlement } = useEntitlement();

  const [state, setState] = useState<ProgramState | null>(null);
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [assessmentsTaken, setAssessmentsTaken] = useState(0);
  const [latestScore, setLatestScore] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await ensureProgramState(db);
        setState(s);
        setSession(getSessionForDay(s.currentDay));
        setAssessmentsTaken(await countAssessments(db));
        const assessments = await listAssessments(db);
        setLatestScore(assessments[assessments.length - 1]?.totalScore ?? null);
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
  const weekNumber = Math.ceil(state.currentDay / 7);
  const dayInWeek = ((state.currentDay - 1) % 7) + 1;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[type.mono, { color: theme.textTertiary }]}>
          WEEK {weekNumber} · DAY {dayInWeek}
        </Text>
        <WeekDots theme={theme} dayInWeek={dayInWeek} />
      </View>

      {!finished && session && !locked && (
        <View style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: theme.surface }}>
          <DemoPlaceholder
            theme={theme}
            label={`SESSION PREVIEW · ${session.blocks.length} BLOCK${session.blocks.length === 1 ? '' : 'S'}`}
            height={118}
            flushTop
          />
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <View style={{ gap: 6 }}>
              <Text style={[type.displayMd, { color: theme.textPrimary, fontSize: 25, lineHeight: 31 }]}>
                {session.title}
              </Text>
              <Text style={[type.body, { color: theme.textSecondary }]}>{session.intent}</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {session.blocks.map((block) => (
                <View
                  key={block.id}
                  style={{
                    borderRadius: radius.pill,
                    paddingVertical: 7,
                    paddingHorizontal: 12,
                    backgroundColor: `${theme.textPrimary}12`,
                  }}
                >
                  <Text style={[type.caption, { color: theme.textSecondary }]}>{blockChipLabel(block)}</Text>
                </View>
              ))}
            </View>
            <Button
              theme={theme}
              label={`Begin — ${session.estimatedMinutes} min`}
              onPress={() => router.push(`/session/${session.id}`)}
            />
          </View>
        </View>
      )}

      {(finished || locked) && (
        <View style={{ gap: spacing.xs }}>
          <Text style={[type.displayMd, { color: theme.textPrimary }]}>
            {finished ? "You've completed the program" : session?.title ?? 'Loading…'}
          </Text>
          {!finished && session && (
            <Text style={[type.body, { color: theme.textSecondary }]}>{session.intent}</Text>
          )}
        </View>
      )}

      {!finished && locked && (
        <Card theme={theme}>
          <View style={{ gap: spacing.md }}>
            <Text style={[type.body, { color: theme.textSecondary }]}>
              The 12-week program is part of membership. The pelvic floor trainer, your first
              check-in, and two guides are free — start there, or unlock the full program now.
            </Text>
            <Button theme={theme} label="See membership" onPress={() => router.push('/paywall')} />
          </View>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Stat theme={theme} label="STREAK" value={String(state.streakCount)} />
        <Stat theme={theme} label="DAYS IN" value={String(Math.max(daysIn, 0))} />
        {!locked && latestScore != null && <Stat theme={theme} label="SCORE" value={String(latestScore)} accent />}
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

function WeekDots({ theme, dayInWeek }: { theme: ReturnType<typeof useTheme>; dayInWeek: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: 7 }).map((_, i) => {
        const day = i + 1;
        const done = day < dayInWeek;
        const current = day === dayInWeek;
        const bg = done ? theme.accent : current ? 'transparent' : theme.textTertiary;
        return (
          <View
            key={day}
            style={{
              width: 8,
              height: 8,
              borderRadius: radius.pill,
              backgroundColor: bg,
              borderWidth: current ? 1.5 : 0,
              borderColor: theme.accent,
              opacity: done || current ? 1 : 0.35,
            }}
          />
        );
      })}
    </View>
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
      <Text style={[type.mono, { color: theme.textTertiary }]}>LAST NIGHT</Text>
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
        flex: 1,
        alignItems: 'center',
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        backgroundColor: pressed ? theme.border : theme.surfaceRaised,
      })}
    >
      <Text style={[type.bodySmall, { color: theme.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

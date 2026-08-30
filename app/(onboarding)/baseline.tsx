import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { listAssessments } from '../../src/db/queries/assessments';
import { completeOnboarding, getProfile } from '../../src/db/queries/profile';
import { track } from '../../src/features/analytics';
import { SEVERITY_LABEL } from '../../src/features/assessment/iief5';
import { computeVariant } from '../../src/features/intake/variant';
import type { IntakeAnswers } from '../../src/features/intake/types';
import { Button } from '../../src/ui/components/Button';
import { Card } from '../../src/ui/components/Card';
import { Screen } from '../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../src/ui/theme';

export default function Baseline() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [score, setScore] = useState<number | null>(null);
  const [severityLabel, setSeverityLabel] = useState('');
  const [reasoning, setReasoning] = useState('');

  useEffect(() => {
    (async () => {
      const assessments = await listAssessments(db);
      const latest = assessments[assessments.length - 1];
      if (latest) {
        setScore(latest.totalScore);
        setSeverityLabel(SEVERITY_LABEL[latest.severity]);
      }
      const profile = await getProfile(db);
      if (profile?.intakeJson) {
        const answers = JSON.parse(profile.intakeJson) as IntakeAnswers;
        setReasoning(computeVariant(answers).reasoning);
      }
    })();
  }, [db]);

  return (
    <Screen back>
      <View style={{ gap: spacing.lg }}>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>Your starting point</Text>

        <Card theme={theme}>
          <Text style={[type.caption, { color: theme.textTertiary }]}>Baseline score</Text>
          <Text style={[type.displayLg, { color: theme.accent, fontVariant: ['tabular-nums'] }]}>
            {score ?? '—'}
            <Text style={[type.bodySmall, { color: theme.textTertiary }]}> / 25</Text>
          </Text>
          <Text style={[type.body, { color: theme.textSecondary }]}>{severityLabel}</Text>
        </Card>

        <Text style={[type.body, { color: theme.textSecondary }]}>{reasoning}</Text>

        <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
          You'll retake this every 4 weeks — not more often, so the trend actually means
          something.
        </Text>
      </View>

      <Button
        theme={theme}
        label="Start day one"
        onPress={async () => {
          await completeOnboarding(db);
          await track(db, 'onboarding_completed');
          router.replace('/(app)/today');
        }}
      />
    </Screen>
  );
}

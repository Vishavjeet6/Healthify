import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { listAssessments, type Assessment, type Severity } from '../../../src/db/queries/assessments';
import { getProfile, type Profile, type ProgramVariant } from '../../../src/db/queries/profile';
import { INTAKE_STEPS, type IntakeStep } from '../../../src/features/intake/steps';
import type { IntakeAnswers } from '../../../src/features/intake/types';
import { computeVariant } from '../../../src/features/intake/variant';
import { Card } from '../../../src/ui/components/Card';
import { Screen } from '../../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../../src/ui/theme';

const VARIANT_LABEL: Record<ProgramVariant, string> = {
  vascular: 'Physical / blood-flow focus',
  psychogenic: 'Mental-performance focus',
  mixed: 'Balanced focus',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  none: 'No dysfunction',
  mild: 'Mild',
  'mild-moderate': 'Mild to moderate',
  moderate: 'Moderate',
  severe: 'Severe',
};

function formatAnswer(step: IntakeStep, value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (step.kind === 'boolean') return value ? 'Yes' : 'No';
  if (step.kind === 'choice') return step.options.find((o) => o.value === value)?.label ?? String(value);
  return String(value);
}

export default function ProfileScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(db), listAssessments(db)]).then(([p, assessments]) => {
      setProfile(p);
      setLatestAssessment(assessments[assessments.length - 1] ?? null);
      setLoading(false);
    });
  }, [db]);

  if (loading) return <Screen back />;

  const answers: Partial<IntakeAnswers> | null = profile?.intakeJson ? JSON.parse(profile.intakeJson) : null;

  return (
    <Screen back>
      <Text style={[type.displayMd, { color: theme.textPrimary }]}>Your profile</Text>

      {!answers ? (
        <Card theme={theme}>
          <Text style={[type.body, { color: theme.textSecondary }]}>
            No intake answers on file yet — they're saved once you complete setup.
          </Text>
        </Card>
      ) : (
        <>
          {profile?.programVariant && (
            <Card theme={theme}>
              <View style={{ gap: spacing.xs }}>
                <Text style={[type.mono, { color: theme.textTertiary }]}>PROGRAM FOCUS</Text>
                <Text style={[type.body, { color: theme.textPrimary }]}>
                  {VARIANT_LABEL[profile.programVariant]}
                </Text>
                <Text style={[type.bodySmall, { color: theme.textSecondary }]}>
                  {computeVariant(answers as IntakeAnswers).reasoning}
                </Text>
              </View>
            </Card>
          )}

          {latestAssessment && (
            <Card theme={theme}>
              <View style={{ gap: spacing.xs }}>
                <Text style={[type.mono, { color: theme.textTertiary }]}>LATEST ASSESSMENT</Text>
                <Text style={[type.body, { color: theme.textPrimary }]}>
                  {SEVERITY_LABEL[latestAssessment.severity]} · score {latestAssessment.totalScore}/25
                </Text>
                <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
                  Taken {new Date(latestAssessment.takenAt).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          )}

          <View style={{ gap: 2 }}>
            <Text style={[type.title, { color: theme.textPrimary }]}>What you told us</Text>
            {INTAKE_STEPS.map((step) => {
              const formatted = formatAnswer(step, (answers as Record<string, unknown>)[step.id]);
              if (formatted === null) return null;
              return (
                <View
                  key={step.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: spacing.md,
                    paddingVertical: spacing.sm,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                  }}
                >
                  <Text style={[type.bodySmall, { color: theme.textSecondary, flex: 1 }]}>{step.prompt}</Text>
                  <Text style={[type.bodySmall, { color: theme.textPrimary }]}>{formatted}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

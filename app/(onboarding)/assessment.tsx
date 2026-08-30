import { useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { insertAssessment } from '../../src/db/queries/assessments';
import { track } from '../../src/features/analytics';
import { IIEF5_QUESTIONS, scoreIief5 } from '../../src/features/assessment/iief5';
import { Screen } from '../../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../../src/ui/theme';

const SCALE = [1, 2, 3, 4, 5];

export default function Assessment() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = IIEF5_QUESTIONS[qIndex];

  async function answer(value: number) {
    const next = [...answers, value];
    setAnswers(next);
    if (next.length === IIEF5_QUESTIONS.length) {
      const { total, severity } = scoreIief5(next);
      await insertAssessment(db, total, severity, next);
      await track(db, 'assessment_taken', { total });
      router.push('/(onboarding)/baseline');
    } else {
      setQIndex(qIndex + 1);
    }
  }

  return (
    <Screen>
      <View style={{ gap: spacing.sm }}>
        <Text style={[type.caption, { color: theme.textTertiary }]}>
          Question {qIndex + 1} of {IIEF5_QUESTIONS.length}
        </Text>
        <Text style={[type.title, { color: theme.textPrimary }]}>{question.prompt}</Text>
        <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
          Over the past 4 weeks, on a scale from 1 (low) to 5 (high).
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        {SCALE.map((v) => (
          <Pressable
            key={v}
            onPress={() => answer(v)}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: radius.md,
              padding: spacing.md,
              backgroundColor: pressed ? theme.surfaceRaised : theme.surface,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
            })}
          >
            <Text style={[type.title, { color: theme.accent, width: 24 }]}>{v}</Text>
            <Text style={[type.body, { color: theme.textPrimary }]}>
              {v === 1 ? 'Low' : v === 5 ? 'High' : ''}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

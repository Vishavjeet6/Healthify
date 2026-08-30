import { useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { insertAssessment } from '../src/db/queries/assessments';
import { track } from '../src/features/analytics';
import { IIEF5_QUESTIONS, scoreIief5 } from '../src/features/assessment/iief5';
import { Screen } from '../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../src/ui/theme';

const SCALE = [1, 2, 3, 4, 5];

export default function AssessmentRetake() {
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
      router.replace('/(app)/progress');
    } else {
      setQIndex(qIndex + 1);
    }
  }

  return (
    <Screen back>
      <View style={{ gap: spacing.sm }}>
        <Text style={[type.caption, { color: theme.textTertiary }]}>
          Question {qIndex + 1} of {IIEF5_QUESTIONS.length}
        </Text>
        <Text style={[type.title, { color: theme.textPrimary }]}>{question.prompt}</Text>
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
            })}
          >
            <Text style={[type.title, { color: theme.accent }]}>{v}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

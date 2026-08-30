import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../ui/components/Button';
import { spacing, type, useTheme } from '../../ui/theme';
import type { HypertonicScreenAnswers } from './hypertonicGate';

const QUESTIONS: { key: keyof HypertonicScreenAnswers; prompt: string }[] = [
  { key: 'pelvicOrPerinealPain', prompt: 'Any ongoing pelvic or perineal pain?' },
  { key: 'urinaryUrgencyOrHesitancy', prompt: 'Urinary urgency, hesitancy, or a weak/interrupted stream?' },
  { key: 'painWithSitting', prompt: 'Pain or discomfort with prolonged sitting?' },
];

/**
 * [CLAIM] pf-hypertonic-gate — shown once, before the first strengthening
 * set. Screens for an already over-tight pelvic floor, which needs
 * relaxation training rather than more contractions. Unreviewed — see
 * content-authoring/CLAIMS.md.
 */
export function HypertonicGateScreen({
  onSubmit,
}: {
  onSubmit: (answers: HypertonicScreenAnswers) => void;
}) {
  const theme = useTheme();
  const [answers, setAnswers] = useState<HypertonicScreenAnswers>({
    pelvicOrPerinealPain: false,
    urinaryUrgencyOrHesitancy: false,
    painWithSitting: false,
  });

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[type.title, { color: theme.textPrimary }]}>Before your first set</Text>
      <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
        A quick check — a small number of men have a pelvic floor that's already tight rather than
        weak, and for that, relaxation works better than squeezing.
      </Text>
      {QUESTIONS.map((q) => (
        <View key={q.key} style={{ gap: spacing.sm }}>
          <Text style={[type.body, { color: theme.textPrimary }]}>{q.prompt}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button
              theme={theme}
              variant={answers[q.key] ? 'primary' : 'ghost'}
              label="Yes"
              onPress={() => setAnswers((a) => ({ ...a, [q.key]: true }))}
            />
            <Button
              theme={theme}
              variant={!answers[q.key] ? 'primary' : 'ghost'}
              label="No"
              onPress={() => setAnswers((a) => ({ ...a, [q.key]: false }))}
            />
          </View>
        </View>
      ))}
      <Button theme={theme} label="Continue" onPress={() => onSubmit(answers)} />
    </View>
  );
}

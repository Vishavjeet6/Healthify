import { useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, TextInput, View } from 'react-native';

import { track } from '../../src/features/analytics';
import { checkRedFlags } from '../../src/features/intake/redFlags';
import { INTAKE_STEPS } from '../../src/features/intake/steps';
import type { IntakeAnswers } from '../../src/features/intake/types';
import { computeVariant } from '../../src/features/intake/variant';
import { recordRedFlagCheck, saveIntake } from '../../src/db/queries/profile';
import { Button } from '../../src/ui/components/Button';
import { Screen } from '../../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../../src/ui/theme';

export default function Intake() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({});
  const [numberDraft, setNumberDraft] = useState('');

  const visibleSteps = INTAKE_STEPS.filter((s) => !s.skip?.(answers));
  const step = visibleSteps[stepIndex];

  async function finish(finalAnswers: Partial<IntakeAnswers>) {
    const complete = finalAnswers as IntakeAnswers;
    const { variant, reasoning } = computeVariant(complete);
    await saveIntake(db, variant, JSON.stringify(complete));

    const redFlag = checkRedFlags(complete);
    await recordRedFlagCheck(db, redFlag.flagged);
    if (redFlag.flagged) {
      await track(db, 'red_flag_shown');
      router.push({ pathname: '/(onboarding)/check', params: { next: '/(onboarding)/assessment' } });
    } else {
      router.push('/(onboarding)/assessment');
    }
    // reasoning is surfaced later on the baseline screen via the stored variant.
    void reasoning;
  }

  function advance(value: unknown) {
    const next = { ...answers, [step.id]: value };
    setAnswers(next);
    setNumberDraft('');
    if (stepIndex + 1 >= visibleSteps.length) {
      finish(next);
    } else {
      setStepIndex(stepIndex + 1);
    }
  }

  if (!step) return null;

  return (
    <Screen>
      <View style={{ gap: spacing.sm }}>
        <Text style={[type.caption, { color: theme.textTertiary }]}>
          {stepIndex + 1} of {visibleSteps.length}
        </Text>
        <Text style={[type.title, { color: theme.textPrimary }]}>{step.prompt}</Text>
      </View>

      <View style={{ gap: spacing.sm, flex: 1 }}>
        {step.kind === 'boolean' && (
          <>
            <OptionButton theme={theme} label="Yes" onPress={() => advance(true)} />
            <OptionButton theme={theme} label="No" onPress={() => advance(false)} />
          </>
        )}

        {step.kind === 'choice' &&
          step.options.map((opt) => (
            <OptionButton
              key={opt.value}
              theme={theme}
              label={opt.label}
              onPress={() => advance(opt.value)}
            />
          ))}

        {step.kind === 'number' && (
          <View style={{ gap: spacing.md }}>
            <TextInput
              value={numberDraft}
              onChangeText={setNumberDraft}
              placeholder={step.placeholder}
              placeholderTextColor={theme.textTertiary}
              keyboardType="number-pad"
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: radius.md,
                padding: spacing.md,
                color: theme.textPrimary,
                fontSize: 18,
              }}
            />
            <Button
              theme={theme}
              label="Continue"
              disabled={!step.optional && numberDraft.trim() === ''}
              onPress={() => advance(numberDraft.trim() === '' ? null : Number(numberDraft))}
            />
            {step.optional && (
              <Button theme={theme} variant="ghost" label="Skip" onPress={() => advance(null)} />
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

function OptionButton({
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
        borderRadius: radius.md,
        padding: spacing.md,
        backgroundColor: pressed ? theme.surfaceRaised : theme.surface,
      })}
    >
      <Text style={[type.body, { color: theme.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

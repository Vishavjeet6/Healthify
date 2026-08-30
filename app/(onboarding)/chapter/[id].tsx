import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';

import { BmiField } from '../../../src/features/intake/BmiField';
import { INTAKE_CHAPTERS } from '../../../src/features/intake/chapters';
import type { IntakeStep } from '../../../src/features/intake/steps';
import { useIntakeFlow } from '../../../src/features/intake/useIntakeFlow';
import type { IntakeAnswers } from '../../../src/features/intake/types';
import { receiptLabel, receiptValue, WARM_CHAPTER_INTRO } from '../../../src/features/intake/warmChapterCopy';
import { useOnboardingTheme, useOnboardingVariant } from '../../../src/features/onboarding/useOnboardingVariant';
import { Button } from '../../../src/ui/components/Button';
import { Screen } from '../../../src/ui/components/Screen';
import { radius, spacing, type } from '../../../src/ui/theme';

const TOTAL_PARTS = 5; // 4 chapters here + the baseline (IIEF-5) assessment screen

type Theme = ReturnType<typeof useOnboardingTheme>;

export default function Chapter() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chapterIndex = INTAKE_CHAPTERS.findIndex((c) => c.id === id);
  const chapter = INTAKE_CHAPTERS[chapterIndex];
  const { variant } = useOnboardingVariant();
  const theme = useOnboardingTheme(variant);
  const flow = useIntakeFlow();

  if (!chapter) return null;

  const steps = flow.stepsFor(chapterIndex);

  return variant === 'warm' ? (
    <ChapterWarm chapterIndex={chapterIndex} chapter={chapter} steps={steps} theme={theme} flow={flow} />
  ) : (
    <ChapterCool chapterIndex={chapterIndex} chapter={chapter} steps={steps} theme={theme} flow={flow} />
  );
}

type ChapterProps = {
  chapterIndex: number;
  chapter: (typeof INTAKE_CHAPTERS)[number];
  steps: IntakeStep[];
  theme: Theme;
  flow: ReturnType<typeof useIntakeFlow>;
};

// ---------------------------------------------------------------------
// Cool (1a): every question in the chapter is answerable at once.
// ---------------------------------------------------------------------

function ChapterCool({ chapterIndex, chapter, steps, theme, flow }: ChapterProps) {
  const { answers, answerStep, goToChapter } = flow;
  const requiredAnswered = steps.every(
    (s) => (s.kind === 'number' && s.optional) || answers[s.id] !== undefined,
  );
  const answeredCount = steps.filter((s) => answers[s.id] !== undefined).length;

  return (
    <Screen back>
      <PartProgress theme={theme} filled={chapter.number} />

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.mono, { color: theme.textTertiary }]}>PART {String(chapter.number).padStart(2, '0')}</Text>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>{chapter.title}</Text>
      </View>

      <View style={{ gap: spacing.lg, flex: 1 }}>
        {steps.map((step) => (
          <StepField key={step.id} step={step} value={answers[step.id]} theme={theme} onAnswer={(v) => answerStep(step.id, v)} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={[type.bodySmall, { color: theme.textTertiary, flex: 1 }]}>
          {answeredCount} of {steps.length} answered
        </Text>
        <View style={{ minWidth: 140 }}>
          <Button
            theme={theme}
            label="Next"
            disabled={!requiredAnswered}
            onPress={() => goToChapter(chapterIndex + 1, answers)}
          />
        </View>
      </View>
    </Screen>
  );
}

function PartProgress({ theme, filled, continuous }: { theme: Theme; filled: number; continuous?: number }) {
  if (continuous != null) {
    return (
      <View style={{ height: 3, borderRadius: 2, backgroundColor: theme.border, overflow: 'hidden' }}>
        <View style={{ width: `${continuous * 100}%`, height: '100%', backgroundColor: theme.accent }} />
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: TOTAL_PARTS }).map((_, i) => (
        <View
          key={i}
          style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < filled ? theme.accent : theme.border }}
        />
      ))}
    </View>
  );
}

function StepField({
  step,
  value,
  theme,
  onAnswer,
}: {
  step: IntakeStep;
  value: unknown;
  theme: Theme;
  onAnswer: (value: unknown) => void;
}) {
  const [draft, setDraft] = useState(value != null ? String(value) : '');

  if (step.kind === 'boolean') {
    return (
      <Field prompt={step.prompt} theme={theme}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pill flex label="Yes" selected={value === true} theme={theme} onPress={() => onAnswer(true)} />
          <Pill flex label="No" selected={value === false} theme={theme} onPress={() => onAnswer(false)} />
        </View>
      </Field>
    );
  }

  if (step.kind === 'choice') {
    return (
      <Field prompt={step.prompt} theme={theme}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {step.options.map((opt) => (
            <Pill
              key={opt.value}
              label={opt.label}
              selected={value === opt.value}
              theme={theme}
              onPress={() => onAnswer(opt.value)}
            />
          ))}
        </View>
      </Field>
    );
  }

  if (step.kind === 'bmi') {
    return (
      <Field prompt={step.prompt} theme={theme}>
        <BmiField theme={theme} value={(value as number | undefined) ?? null} onChange={onAnswer} />
      </Field>
    );
  }

  // number
  return (
    <Field prompt={step.prompt} theme={theme}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
        <TextInput
          value={draft}
          onChangeText={(t) => {
            setDraft(t);
            onAnswer(t.trim() === '' ? null : Number(t));
          }}
          placeholder={step.placeholder}
          placeholderTextColor={theme.textTertiary}
          keyboardType="number-pad"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: radius.md,
            padding: spacing.md,
            color: theme.textPrimary,
            fontSize: 16,
          }}
        />
        {step.optional && <Text style={[type.caption, { color: theme.textTertiary }]}>optional</Text>}
      </View>
    </Field>
  );
}

function Field({ prompt, theme, children }: { prompt: string; theme: Theme; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[type.body, { color: theme.textPrimary, fontSize: 16 }]}>{prompt}</Text>
      {children}
    </View>
  );
}

function Pill({
  label,
  selected,
  theme,
  onPress,
  flex,
}: {
  label: string;
  selected: boolean;
  theme: Theme;
  onPress: () => void;
  flex?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: flex ? 1 : undefined,
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderRadius: flex ? radius.md : radius.pill,
        backgroundColor: selected ? theme.accent : pressed ? theme.border : theme.surfaceRaised,
      })}
    >
      <Text
        style={[
          type.bodySmall,
          { color: selected ? theme.accentOn : theme.textPrimary, fontWeight: selected ? '600' : '400' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------
// Warm (1b): one question at a time; answered ones collapse into a
// "receipt" list above, each with a Change link back into it.
// ---------------------------------------------------------------------

function ChapterWarm({ chapterIndex, chapter, steps, theme, flow }: ChapterProps) {
  const { answers, answerStep, goToChapter } = flow;
  const [editingId, setEditingId] = useState<keyof IntakeAnswers | null>(null);

  const firstUnanswered = steps.find((s) => answers[s.id] === undefined);
  const activeStep = (editingId && steps.find((s) => s.id === editingId)) || firstUnanswered;
  const answeredSteps = steps.filter((s) => s.id !== activeStep?.id && answers[s.id] !== undefined);
  const answeredCount = steps.filter((s) => answers[s.id] !== undefined).length;
  const chapterProgress = (chapter.number - 1 + (steps.length ? answeredCount / steps.length : 0)) / TOTAL_PARTS;

  // Once every step in the chapter (including any newly-revealed
  // conditional one, e.g. diabetesTreated after diagnosedDiabetes) is
  // answered, activeStep goes undefined on its own — recomputed fresh
  // each render from live steps/answers — and this moves on. Doing the
  // "anything left?" check here instead of inline in the tap handler
  // avoids racing a stale `steps` snapshot from before the tap.
  useEffect(() => {
    if (!activeStep) goToChapter(chapterIndex + 1, answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  function answerAndAdvance(step: IntakeStep, value: unknown) {
    answerStep(step.id, value);
    setEditingId(null);
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()}>
          <Text style={[type.body, { color: theme.textTertiary, fontSize: 15 }]}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <PartProgress theme={theme} filled={0} continuous={chapterProgress} />
        </View>
        <Text style={[type.mono, { color: theme.textTertiary }]}>
          {String(chapter.number).padStart(2, '0')}/{TOTAL_PARTS}
        </Text>
      </View>

      <View style={{ gap: spacing.lg, flex: 1 }}>
        <Text style={[type.displayMd, { color: theme.textPrimary, fontSize: 27, lineHeight: 34 }]}>
          {WARM_CHAPTER_INTRO[chapter.id]}
        </Text>

        {answeredSteps.length > 0 && (
          <View style={{ gap: spacing.sm }}>
            {answeredSteps.map((step) => (
              <ReceiptRow
                key={step.id}
                theme={theme}
                label={receiptLabel(step)}
                value={receiptValue(step, answers)}
                onChange={() => setEditingId(step.id)}
              />
            ))}
          </View>
        )}

        {activeStep && (
          <WarmField
            key={activeStep.id}
            step={activeStep}
            value={answers[activeStep.id]}
            theme={theme}
            onAnswer={(v) => answerAndAdvance(activeStep, v)}
          />
        )}
      </View>

      <Text style={[type.bodySmall, { color: theme.textTertiary }]}>Nothing here leaves your phone. Skip any question.</Text>
    </Screen>
  );
}

function ReceiptRow({
  theme,
  label,
  value,
  onChange,
}: {
  theme: Theme;
  label: string;
  value: string;
  onChange: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.surfaceRaised,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ gap: 3 }}>
        <Text style={[type.caption, { color: theme.textTertiary }]}>{label}</Text>
        <Text style={[type.body, { color: theme.textPrimary, fontSize: 15.5 }]}>{value}</Text>
      </View>
      <Pressable onPress={onChange}>
        <Text style={[type.caption, { color: theme.accent }]}>Change</Text>
      </Pressable>
    </View>
  );
}

function WarmField({
  step,
  value,
  theme,
  onAnswer,
}: {
  step: IntakeStep;
  value: unknown;
  theme: Theme;
  onAnswer: (value: unknown) => void;
}) {
  const [draft, setDraft] = useState(value != null ? String(value) : '');
  const [bmiDraft, setBmiDraft] = useState<number | null>(step.kind === 'bmi' && value != null ? (value as number) : null);

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={[type.body, { color: theme.textPrimary, fontSize: 17, lineHeight: 25 }]}>{step.prompt}</Text>

      {step.kind === 'bmi' && (
        <View style={{ gap: spacing.sm }}>
          <BmiField theme={theme} value={bmiDraft} onChange={setBmiDraft} />
          <Button theme={theme} label="Continue" disabled={bmiDraft == null} onPress={() => onAnswer(bmiDraft)} />
        </View>
      )}

      {step.kind === 'boolean' && (
        <View style={{ gap: spacing.sm }}>
          <WarmRow label="Yes" theme={theme} onPress={() => onAnswer(true)} />
          <WarmRow label="No" theme={theme} onPress={() => onAnswer(false)} />
        </View>
      )}

      {step.kind === 'choice' && (
        <View style={{ gap: spacing.sm }}>
          {step.options.map((opt) => (
            <WarmRow key={opt.value} label={opt.label} theme={theme} onPress={() => onAnswer(opt.value)} />
          ))}
        </View>
      )}

      {step.kind === 'number' && (
        <View style={{ gap: spacing.sm }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={step.placeholder}
            placeholderTextColor={theme.textTertiary}
            keyboardType="number-pad"
            style={{
              borderRadius: radius.md,
              padding: spacing.md,
              backgroundColor: theme.surfaceRaised,
              color: theme.textPrimary,
              fontSize: 16,
            }}
          />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                theme={theme}
                label="Continue"
                disabled={!step.optional && draft.trim() === ''}
                onPress={() => onAnswer(draft.trim() === '' ? null : Number(draft))}
              />
            </View>
            {step.optional && (
              <View style={{ flex: 1 }}>
                <Button theme={theme} variant="ghost" label="Skip" onPress={() => onAnswer(null)} />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function WarmRow({ label, theme, onPress }: { label: string; theme: Theme; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radius.lg,
        paddingVertical: 16,
        paddingHorizontal: 18,
        backgroundColor: pressed ? theme.border : theme.surfaceRaised,
      })}
    >
      <Text style={[type.body, { color: theme.textPrimary, fontSize: 15.5 }]}>{label}</Text>
    </Pressable>
  );
}

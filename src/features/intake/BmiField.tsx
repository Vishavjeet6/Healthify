import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { radius, spacing, type, type ThemeTokens } from '../../ui/theme';
import { bmiFromMetric, bmiFromStandard } from './bmi';

type Mode = 'direct' | 'calculate';
type Unit = 'standard' | 'metric';

/**
 * BMI is mandatory (see steps.ts), but most people don't know their
 * BMI offhand — so this defaults to direct entry (fast, if you know
 * it) with a "calculate it" escape hatch that derives BMI from height
 * + weight in either unit system. Both paths converge on the same
 * `onChange(number | null)` so the parent step never needs to know
 * which path was used.
 */
export function BmiField({
  theme,
  value,
  onChange,
}: {
  theme: ThemeTokens;
  value: number | null;
  onChange: (bmi: number | null) => void;
}) {
  const [mode, setMode] = useState<Mode>('direct');
  const [unit, setUnit] = useState<Unit>('standard');
  const [directDraft, setDirectDraft] = useState(value != null ? String(value) : '');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightLb, setWeightLb] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const calculated =
    unit === 'standard'
      ? bmiFromStandard(Number(heightFt) || 0, Number(heightIn) || 0, Number(weightLb))
      : bmiFromMetric(Number(heightCm), Number(weightKg));

  useEffect(() => {
    if (mode === 'calculate') onChange(calculated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, calculated]);

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: theme.textPrimary,
    fontSize: 16,
  };

  if (mode === 'direct') {
    return (
      <View style={{ gap: spacing.sm }}>
        <TextInput
          value={directDraft}
          onChangeText={(t) => {
            setDirectDraft(t);
            onChange(t.trim() === '' ? null : Number(t));
          }}
          placeholder="BMI"
          placeholderTextColor={theme.textTertiary}
          keyboardType="number-pad"
          style={inputStyle}
        />
        <Pressable onPress={() => { setMode('calculate'); onChange(calculated); }}>
          <Text style={[type.caption, { color: theme.accent }]}>Don't know it? Calculate it from height and weight</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <UnitOption label="Standard (ft/in, lb)" selected={unit === 'standard'} theme={theme} onPress={() => setUnit('standard')} />
        <UnitOption label="Metric (cm, kg)" selected={unit === 'metric'} theme={theme} onPress={() => setUnit('metric')} />
      </View>

      {unit === 'standard' ? (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TextInput
              value={heightFt}
              onChangeText={setHeightFt}
              placeholder="Height (ft)"
              placeholderTextColor={theme.textTertiary}
              keyboardType="number-pad"
              style={[inputStyle, { flex: 1 }]}
            />
            <TextInput
              value={heightIn}
              onChangeText={setHeightIn}
              placeholder="Height (in)"
              placeholderTextColor={theme.textTertiary}
              keyboardType="number-pad"
              style={[inputStyle, { flex: 1 }]}
            />
          </View>
          <TextInput
            value={weightLb}
            onChangeText={setWeightLb}
            placeholder="Weight (lb)"
            placeholderTextColor={theme.textTertiary}
            keyboardType="number-pad"
            style={inputStyle}
          />
        </>
      ) : (
        <>
          <TextInput
            value={heightCm}
            onChangeText={setHeightCm}
            placeholder="Height (cm)"
            placeholderTextColor={theme.textTertiary}
            keyboardType="number-pad"
            style={inputStyle}
          />
          <TextInput
            value={weightKg}
            onChangeText={setWeightKg}
            placeholder="Weight (kg)"
            placeholderTextColor={theme.textTertiary}
            keyboardType="number-pad"
            style={inputStyle}
          />
        </>
      )}

      <Text style={[type.bodySmall, { color: theme.textSecondary }]}>
        {calculated != null ? `Your BMI: ${calculated}` : 'Enter height and weight to calculate your BMI.'}
      </Text>

      <Pressable onPress={() => setMode('direct')}>
        <Text style={[type.caption, { color: theme.accent }]}>Know your BMI? Enter it directly instead</Text>
      </Pressable>
    </View>
  );
}

function UnitOption({
  label,
  selected,
  theme,
  onPress,
}: {
  label: string;
  selected: boolean;
  theme: ThemeTokens;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: radius.md,
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

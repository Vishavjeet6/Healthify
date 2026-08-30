import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BASELINE_CHAPTER, INTAKE_CHAPTERS } from '../../src/features/intake/chapters';
import { useIntakeFlow } from '../../src/features/intake/useIntakeFlow';
import { useOnboardingTheme, useOnboardingVariant } from '../../src/features/onboarding/useOnboardingVariant';
import { Button } from '../../src/ui/components/Button';
import { Screen } from '../../src/ui/components/Screen';
import { spacing, type } from '../../src/ui/theme';

export default function OnboardingMap() {
  const { variant } = useOnboardingVariant();
  const theme = useOnboardingTheme(variant);
  const { stepsFor } = useIntakeFlow();

  return (
    <Screen back>
      <View style={{ gap: spacing.md }}>
        <Text style={[type.mono, { color: theme.textTertiary }]}>SETUP · 4 MIN</Text>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>
          Five short parts, then your starting point.
        </Text>
      </View>

      <View style={{ gap: 2 }}>
        {INTAKE_CHAPTERS.map((chapter, i) => (
          <View
            key={chapter.id}
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              alignItems: 'flex-start',
              paddingVertical: spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.border,
            }}
          >
            <Text style={[type.mono, { color: theme.accent, width: 20, paddingTop: 3 }]}>
              {String(chapter.number).padStart(2, '0')}
            </Text>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[type.body, { color: theme.textPrimary, fontSize: 15.5 }]}>{chapter.title}</Text>
              <Text style={[type.bodySmall, { color: theme.textTertiary }]}>{chapter.blurb}</Text>
            </View>
            <Text style={[type.mono, { color: theme.textTertiary }]}>{stepsFor(i).length}</Text>
          </View>
        ))}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            alignItems: 'flex-start',
            paddingVertical: spacing.md,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text style={[type.mono, { color: theme.accent, width: 20, paddingTop: 3 }]}>
            {String(BASELINE_CHAPTER.number).padStart(2, '0')}
          </Text>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[type.body, { color: theme.textPrimary, fontSize: 15.5 }]}>{BASELINE_CHAPTER.title}</Text>
            <Text style={[type.bodySmall, { color: theme.textTertiary }]}>{BASELINE_CHAPTER.blurb}</Text>
          </View>
          <Text style={[type.mono, { color: theme.textTertiary }]}>5</Text>
        </View>
      </View>

      <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
        Answers shape which version of the program you get. Skip anything you'd rather not
        answer.
      </Text>

      <Button
        theme={theme}
        label="Begin part one"
        onPress={() => router.push(`/(onboarding)/chapter/${INTAKE_CHAPTERS[0].id}`)}
      />
    </Screen>
  );
}

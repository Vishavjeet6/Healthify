import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { APP_NAME } from '../../src/constants/brand';
import { track } from '../../src/features/analytics';
import { useOnboardingTheme, useOnboardingVariant } from '../../src/features/onboarding/useOnboardingVariant';
import { Button } from '../../src/ui/components/Button';
import { Screen } from '../../src/ui/components/Screen';
import { radius, spacing, type } from '../../src/ui/theme';

const FACTS = [
  'No medication, no consultations',
  'Stays on this device unless you back it up',
  'Trainer is free, no account',
];

export default function Welcome() {
  const db = useSQLiteContext();
  const { variant } = useOnboardingVariant();
  const theme = useOnboardingTheme(variant);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between', gap: spacing.xl }}>
        <View style={{ gap: spacing.xl, paddingTop: spacing.xl }}>
          <View style={{ gap: spacing.lg }}>
            <Text style={[type.displayLg, { color: theme.textPrimary, letterSpacing: -0.2 }]}>
              Twelve weeks.{'\n'}Nobody else{'\n'}involved.
            </Text>
            <Text style={[type.body, { color: theme.textSecondary, maxWidth: 320 }]}>
              {APP_NAME} trains pelvic floor strength, movement, sleep, and the pressure side of
              it — one structured program you run yourself.
            </Text>
          </View>

          <View
            style={{
              gap: spacing.md,
              paddingTop: spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.border,
            }}
          >
            {FACTS.map((fact) => (
              <View key={fact} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                <View style={{ width: 5, height: 5, borderRadius: radius.pill, backgroundColor: theme.accent }} />
                <Text style={[type.bodySmall, { color: theme.textSecondary }]}>{fact}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button
          theme={theme}
          label="Start"
          onPress={async () => {
            await track(db, 'onboarding_started');
            router.push('/(onboarding)/map');
          }}
        />
      </View>
    </Screen>
  );
}

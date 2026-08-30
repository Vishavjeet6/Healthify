import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { APP_NAME } from '../../src/constants/brand';
import { track } from '../../src/features/analytics';
import { Button } from '../../src/ui/components/Button';
import { Screen } from '../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../src/ui/theme';

export default function Welcome() {
  const theme = useTheme();
  const db = useSQLiteContext();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <Text style={[type.displayLg, { color: theme.textPrimary }]}>{APP_NAME}</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>
          A private, structured program to train sexual performance — pelvic floor work,
          movement, sleep, and easing performance pressure. No medication, no consultations,
          nothing you don't do yourself.
        </Text>
        <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
          Everything you enter stays on this device unless you choose to back it up.
        </Text>
      </View>
      <Button
        theme={theme}
        label="Get started"
        onPress={async () => {
          await track(db, 'onboarding_started');
          router.push('/(onboarding)/intake');
        }}
      />
    </Screen>
  );
}

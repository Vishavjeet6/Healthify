import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { track } from '../../src/features/analytics';
import { Button } from '../../src/ui/components/Button';
import { Screen } from '../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../src/ui/theme';

/**
 * The red-flag acknowledgement screen. Plain, calm, non-alarming.
 * No booking, no referral, no partner link, no revenue — and it never
 * blocks continuation. See IMPLEMENTATION_PLAN.md, feature 2.
 */
export default function Check() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ next: string }>();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>Worth a mention</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>
          Based on what you shared, this pattern is worth getting checked by a doctor when you get
          a chance. The training in this app still helps either way, and it isn't a substitute for
          that.
        </Text>
        <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
          Nothing about this is shared anywhere — it's just worth knowing.
        </Text>
      </View>
      <Button
        theme={theme}
        label="Understood, continue"
        onPress={async () => {
          await track(db, 'red_flag_acknowledged');
          router.replace((params.next as string) ?? '/(onboarding)/assessment');
        }}
      />
    </Screen>
  );
}

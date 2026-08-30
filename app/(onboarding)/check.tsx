import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { track } from '../../src/features/analytics';
import { useOnboardingTheme, useOnboardingVariant } from '../../src/features/onboarding/useOnboardingVariant';
import { Button } from '../../src/ui/components/Button';
import { Screen } from '../../src/ui/components/Screen';
import { radius, spacing, type } from '../../src/ui/theme';

/**
 * The red-flag acknowledgement screen. Plain, calm, non-alarming.
 * No booking, no referral, no partner link, no revenue — and it never
 * blocks continuation. See IMPLEMENTATION_PLAN.md, feature 2.
 */
export default function Check() {
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{ next: string }>();
  const { variant } = useOnboardingVariant();
  const theme = useOnboardingTheme(variant);

  return (
    <Screen back>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.xl }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: `${theme.alert}29`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: theme.alert }} />
        </View>

        <View style={{ gap: spacing.lg }}>
          <Text style={[type.displayMd, { color: theme.textPrimary }]}>Worth a mention</Text>
          <Text style={[type.body, { color: theme.textSecondary, lineHeight: 26 }]}>
            Based on what you shared, this pattern is worth getting checked by a doctor when you
            get a chance. The training in this app still helps either way, and it isn't a
            substitute for that.
          </Text>
          <View
            style={{
              borderLeftWidth: 2,
              borderLeftColor: `${theme.alert}80`,
              paddingLeft: spacing.md,
            }}
          >
            <Text style={[type.bodySmall, { color: theme.textTertiary, lineHeight: 21 }]}>
              Nothing about this is shared anywhere — it's just worth knowing. No booking, no
              referral, no follow-up.
            </Text>
          </View>
        </View>
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

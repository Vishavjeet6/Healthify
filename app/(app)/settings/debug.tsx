import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { logoutForOnboarding } from '../../../src/features/devtools/logout';
import { MockPurchaseProvider } from '../../../src/features/paywall/MockPurchaseProvider';
import { useEntitlement } from '../../../src/features/paywall/useEntitlement';
import { useOnboardingVariant } from '../../../src/features/onboarding/useOnboardingVariant';
import { Button } from '../../../src/ui/components/Button';
import { Card } from '../../../src/ui/components/Card';
import { Screen } from '../../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../../src/ui/theme';

/** __DEV__-only. Toggles mock entitlement so every gated path is testable. */
export default function Debug() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { entitlement, refresh } = useEntitlement();
  const provider = new MockPurchaseProvider(db);
  const { variant, setVariant } = useOnboardingVariant();
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <Screen back>
      <Text style={[type.displayMd, { color: theme.textPrimary }]}>Debug</Text>
      <Card theme={theme}>
        <View style={{ gap: spacing.md }}>
          <Text style={[type.body, { color: theme.textPrimary }]}>
            Entitlement: {entitlement.active ? 'active' : 'inactive'}
          </Text>
          <Button
            theme={theme}
            label={entitlement.active ? 'Deactivate' : 'Activate'}
            onPress={async () => {
              await provider.setActiveForDebug(!entitlement.active);
              await refresh();
            }}
          />
        </View>
      </Card>

      <Card theme={theme}>
        <View style={{ gap: spacing.md }}>
          <Text style={[type.body, { color: theme.textPrimary }]}>
            Onboarding style: {variant === 'warm' ? 'Warm (1b)' : 'Cool (1a)'}
          </Text>
          <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
            Restart onboarding (Welcome → Start) to see it applied end to end.
          </Text>
          <Button
            theme={theme}
            variant="secondary"
            label={variant === 'warm' ? 'Switch to Cool (1a)' : 'Switch to Warm (1b)'}
            onPress={() => setVariant(variant === 'warm' ? 'cool' : 'warm')}
          />
        </View>
      </Card>

      <Card theme={theme}>
        <View style={{ gap: spacing.md }}>
          <Text style={[type.body, { color: theme.textPrimary }]}>Log out</Text>
          <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
            Wipes intake answers, assessments, and progress on this device, then restarts
            onboarding from Welcome. Does not touch entitlement or the onboarding style above.
          </Text>
          <Button
            theme={theme}
            variant="secondary"
            label={loggingOut ? 'Logging out…' : 'Log out and restart onboarding'}
            disabled={loggingOut}
            onPress={async () => {
              setLoggingOut(true);
              await logoutForOnboarding(db);
              router.replace('/');
            }}
          />
        </View>
      </Card>
    </Screen>
  );
}

import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { MockPurchaseProvider } from '../../../src/features/paywall/MockPurchaseProvider';
import { useEntitlement } from '../../../src/features/paywall/useEntitlement';
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

  return (
    <Screen>
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
    </Screen>
  );
}

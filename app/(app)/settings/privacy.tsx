import { Text, View } from 'react-native';

import { Screen } from '../../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../../src/ui/theme';

export default function Privacy() {
  const theme = useTheme();
  return (
    <Screen back>
      <Text style={[type.displayMd, { color: theme.textPrimary }]}>Privacy</Text>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.title, { color: theme.textPrimary }]}>On this device</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>
          By default, everything you enter — your assessment answers, session history, logs, and
          reflections — is stored only on this device. No account is required to use the app.
          Nothing is sent anywhere.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.title, { color: theme.textPrimary }]}>If you turn on backup</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>
          Backup is opt-in, from Settings, and off by default. If you turn it on, a copy of your
          data is stored so you can restore it on a new device. This device remains the source of
          truth; the backup is a copy of it.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.title, { color: theme.textPrimary }]}>Your data</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>
          You can delete everything at any time by deleting the app. There is no way for us to
          reconstruct it afterward.
        </Text>
      </View>
    </Screen>
  );
}

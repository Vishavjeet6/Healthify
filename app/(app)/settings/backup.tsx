import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, TextInput, View } from 'react-native';

import { track } from '../../../src/features/analytics';
import { MockSyncProvider } from '../../../src/features/sync/MockSyncProvider';
import { Button } from '../../../src/ui/components/Button';
import { Card } from '../../../src/ui/components/Card';
import { Screen } from '../../../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../../../src/ui/theme';

export default function Backup() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const provider = new MockSyncProvider(db);
  const [optedIn, setOptedIn] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    provider.isOptedIn().then(setOptedIn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (optedIn) {
    return (
      <Screen>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>Backup is on</Text>
        <Card theme={theme}>
          <Text style={[type.body, { color: theme.textSecondary }]}>
            Your progress is backed up. Everything still lives on this device first — the backup
            is a copy, not the source.
          </Text>
        </Card>
        <Button
          theme={theme}
          variant="ghost"
          label="Turn off backup"
          onPress={async () => {
            await provider.optOut();
            setOptedIn(false);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: spacing.sm }}>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>Back up your progress</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>
          By default, everything stays on this device only. Backing up means you can restore your
          progress if you switch phones — nothing is required, and nothing changes unless you opt
          in here.
        </Text>
      </View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        placeholderTextColor={theme.textTertiary}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: radius.md,
          padding: spacing.md,
          color: theme.textPrimary,
        }}
      />
      <Button
        theme={theme}
        label="Enable backup"
        disabled={!email.includes('@')}
        onPress={async () => {
          await provider.optIn(email);
          await track(db, 'backup_opted_in');
          setOptedIn(true);
        }}
      />
    </Screen>
  );
}

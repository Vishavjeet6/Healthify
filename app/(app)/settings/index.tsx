import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Switch, Text, View } from 'react-native';

import {
  cancelDailyReminder,
  isReminderScheduled,
  scheduleDailyReminder,
} from '../../../src/features/notifications';
import { track } from '../../../src/features/analytics';
import { Card } from '../../../src/ui/components/Card';
import { Screen } from '../../../src/ui/components/Screen';
import { Button } from '../../../src/ui/components/Button';
import { spacing, type, useTheme } from '../../../src/ui/theme';

export default function SettingsIndex() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [reminderOn, setReminderOn] = useState(false);

  useEffect(() => {
    isReminderScheduled().then(setReminderOn);
  }, []);

  async function toggleReminder(value: boolean) {
    if (value) {
      const ok = await scheduleDailyReminder(20, 0);
      setReminderOn(ok);
      if (ok) await track(db, 'reminder_scheduled');
    } else {
      await cancelDailyReminder();
      setReminderOn(false);
    }
  }

  return (
    <Screen>
      <Text style={[type.displayMd, { color: theme.textPrimary }]}>Settings</Text>

      <Card theme={theme}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[type.body, { color: theme.textPrimary }]}>Daily reminder</Text>
            <Text style={[type.caption, { color: theme.textTertiary }]}>8:00 PM · discreet text only</Text>
          </View>
          <Switch value={reminderOn} onValueChange={toggleReminder} />
        </View>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <Button theme={theme} variant="secondary" label="Back up my progress" onPress={() => router.push('/(app)/settings/backup')} />
        <Button theme={theme} variant="secondary" label="Privacy" onPress={() => router.push('/(app)/settings/privacy')} />
        {__DEV__ && (
          <Button theme={theme} variant="ghost" label="Debug" onPress={() => router.push('/(app)/settings/debug')} />
        )}
      </View>
    </Screen>
  );
}

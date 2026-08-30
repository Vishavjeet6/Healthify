import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { countTrainerRuns } from '../../../src/db/queries/trainerRuns';
import { usePelvicFloorMode } from '../../../src/features/trainer/usePelvicFloorMode';
import { Button } from '../../../src/ui/components/Button';
import { Card } from '../../../src/ui/components/Card';
import { Screen } from '../../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../../src/ui/theme';

export default function TrainerHome() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { mode, level, refresh } = usePelvicFloorMode();
  const [runsDone, setRunsDone] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refresh();
      countTrainerRuns(db).then(setRunsDone);
    }, [db, refresh]),
  );

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>Pelvic floor trainer</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>
          Free, always. No account needed.
        </Text>
      </View>

      <Card theme={theme}>
        <Text style={[type.body, { color: theme.textPrimary }]}>
          New here? Your first set walks you through finding the right muscle before any timed
          work starts.
        </Text>
        <Button
          theme={theme}
          variant="secondary"
          label="Why pelvic floor training"
          onPress={() => router.push('/(app)/learn/why-pelvic-floor')}
        />
      </Card>

      <Card theme={theme}>
        <Text style={[type.caption, { color: theme.textTertiary }]}>
          {mode === 'downtraining' ? 'Relaxation mode' : `Level ${level}`}
        </Text>
        <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
          {runsDone} completed sets so far
        </Text>
        <Button theme={theme} label="Start today's set" onPress={() => router.push('/trainer/run')} />
      </Card>
    </Screen>
  );
}

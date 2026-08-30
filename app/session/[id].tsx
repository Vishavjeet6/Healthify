import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, View } from 'react-native';

import { absoluteDayFor, getSessionById } from '../../src/content/loader';
import { isSessionCompleted, recordSessionCompletion } from '../../src/db/queries/sessionCompletions';
import { ensureProgramState, recordDayCompleted } from '../../src/db/queries/programState';
import { track } from '../../src/features/analytics';
import { BlockRenderer } from '../../src/features/session/BlockRenderer';
import { Screen } from '../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../src/ui/theme';

export default function SessionPlayer() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = getSessionById(id);
  const [blockIndex, setBlockIndex] = useState(0);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    track(db, 'session_started', { sessionId: id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) {
    return (
      <Screen>
        <Text style={[type.body, { color: theme.textPrimary }]}>Session not found.</Text>
      </Screen>
    );
  }

  const block = session.blocks[blockIndex];

  async function finishSession() {
    // Guards against a double-submit (e.g. a rapid double-tap on the
    // last block) advancing program day twice for one session.
    const alreadyDone = await isSessionCompleted(db, session!.id);
    if (alreadyDone) {
      router.replace('/(app)/today');
      return;
    }

    const durationS = Math.round((Date.now() - startedAt) / 1000);
    await recordSessionCompletion(db, session!.id, absoluteDayFor(session!), durationS);
    await track(db, 'session_completed', { sessionId: session!.id, durationS });

    const state = await ensureProgramState(db);
    if (absoluteDayFor(session!) === state.currentDay) {
      await recordDayCompleted(db);
    }

    router.replace('/(app)/today');
  }

  function advance() {
    if (blockIndex + 1 >= session!.blocks.length) {
      finishSession();
    } else {
      setBlockIndex(blockIndex + 1);
    }
  }

  return (
    <Screen>
      <View style={{ gap: spacing.xs }}>
        <Text style={[type.caption, { color: theme.textTertiary }]}>
          {blockIndex + 1} of {session.blocks.length}
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <BlockRenderer block={block} onDone={advance} />
      </View>
    </Screen>
  );
}

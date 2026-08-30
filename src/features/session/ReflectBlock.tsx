import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Text, TextInput, View } from 'react-native';

import { setSetting } from '../../db/queries/settings';
import type { Block } from '../../content/schema';
import { Button } from '../../ui/components/Button';
import { radius, spacing, type, useTheme } from '../../ui/theme';

type ReflectBlockType = Extract<Block, { kind: 'reflect' }>;

export function ReflectBlock({ block, onDone }: { block: ReflectBlockType; onDone: () => void }) {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [text, setText] = useState('');

  async function submit() {
    if (text.trim()) {
      await setSetting(db, `reflect:${block.storeKey}`, text.trim());
    }
    onDone();
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[type.title, { color: theme.textPrimary }]}>{block.prompt}</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder="Optional — write as much or little as you like"
        placeholderTextColor={theme.textTertiary}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: radius.md,
          padding: spacing.md,
          minHeight: 100,
          color: theme.textPrimary,
          textAlignVertical: 'top',
        }}
      />
      <Button theme={theme} label="Continue" onPress={submit} />
    </View>
  );
}

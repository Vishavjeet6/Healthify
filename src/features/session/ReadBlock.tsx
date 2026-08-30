import { Text, View } from 'react-native';

import type { Block } from '../../content/schema';
import { Button } from '../../ui/components/Button';
import { spacing, type, useTheme } from '../../ui/theme';

type ReadBlockType = Extract<Block, { kind: 'read' }>;

export function ReadBlock({ block, onDone }: { block: ReadBlockType; onDone: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[type.body, { color: theme.textPrimary, lineHeight: 26 }]}>{block.body}</Text>
      <Button theme={theme} label="Continue" onPress={onDone} />
    </View>
  );
}

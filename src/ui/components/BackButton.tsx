import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { type, useTheme } from '../theme';

export function BackButton({ onPress, label = 'Back' }: { onPress?: () => void; label?: string }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={12}
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      style={({ pressed }) => ({ alignSelf: 'flex-start', opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={[type.body, { color: theme.textSecondary, fontSize: 22 }]}>‹</Text>
    </Pressable>
  );
}

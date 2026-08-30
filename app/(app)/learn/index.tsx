import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { loadProgramContent } from '../../../src/content/loader';
import { Screen } from '../../../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../../../src/ui/theme';

export default function LearnIndex() {
  const theme = useTheme();
  const { education } = loadProgramContent();

  return (
    <Screen>
      <Text style={[type.displayMd, { color: theme.textPrimary }]}>Learn</Text>
      <View style={{ gap: spacing.sm }}>
        {education.map((piece) => (
          <Pressable
            key={piece.slug}
            onPress={() => router.push(`/(app)/learn/${piece.slug}`)}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: radius.md,
              padding: spacing.md,
              backgroundColor: pressed ? theme.surfaceRaised : theme.surface,
              gap: 4,
            })}
          >
            <Text style={[type.body, { color: theme.textPrimary }]}>{piece.title}</Text>
            <Text style={[type.caption, { color: theme.textTertiary }]}>
              {piece.estimatedMinutes} min
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

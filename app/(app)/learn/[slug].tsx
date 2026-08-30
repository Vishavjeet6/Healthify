import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { loadProgramContent } from '../../../src/content/loader';
import { Screen } from '../../../src/ui/components/Screen';
import { spacing, type, useTheme } from '../../../src/ui/theme';

export default function LearnDetail() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { education } = loadProgramContent();
  const piece = education.find((p) => p.slug === slug);

  if (!piece) {
    return (
      <Screen>
        <Text style={[type.body, { color: theme.textPrimary }]}>Not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>{piece.title}</Text>
        <Text style={[type.body, { color: theme.textSecondary, lineHeight: 26 }]}>{piece.body}</Text>
      </View>
    </Screen>
  );
}

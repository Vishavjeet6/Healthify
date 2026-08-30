import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '../theme';
import { useTheme } from '../theme';

export function Screen({
  children = null,
  scroll = true,
  padded = true,
}: {
  children?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
}) {
  const theme = useTheme();
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.ground }]}>
      <Container
        style={styles.flex}
        contentContainerStyle={padded ? styles.padded : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { padding: spacing.lg, gap: spacing.lg },
});

import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '../theme';
import { useTheme } from '../theme';
import { BackButton } from './BackButton';

export function Screen({
  children = null,
  scroll = true,
  padded = true,
  back = false,
}: {
  children?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Show a "‹ Back" control above content — for pushed/modal screens with no native back affordance (esp. on web). */
  back?: boolean;
}) {
  const theme = useTheme();
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.ground }]}>
      <Container
        style={styles.flex}
        contentContainerStyle={padded ? styles.padded : undefined}
      >
        {back && <BackButton />}
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { padding: spacing.lg, gap: spacing.lg, flexGrow: 1 },
});

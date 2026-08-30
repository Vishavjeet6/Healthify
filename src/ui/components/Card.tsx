import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { radius, spacing, type useTheme } from '../theme';

type Theme = ReturnType<typeof useTheme>;

export function Card({
  theme,
  children,
  style,
}: {
  theme: Theme;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});

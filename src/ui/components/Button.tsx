import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing, type useTheme } from '../theme';

type Theme = ReturnType<typeof useTheme>;

type Props = {
  label: string;
  onPress: () => void;
  theme: Theme;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
};

export function Button({ label, onPress, theme, variant = 'primary', disabled }: Props) {
  const bg =
    variant === 'primary' ? theme.accent : variant === 'secondary' ? theme.surfaceRaised : 'transparent';
  const fg = variant === 'primary' ? theme.accentOn : theme.textPrimary;
  const borderColor = variant === 'ghost' ? theme.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});

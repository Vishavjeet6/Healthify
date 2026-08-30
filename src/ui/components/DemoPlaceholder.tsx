import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { radius, spacing, type, useTheme } from '../theme';

type Theme = ReturnType<typeof useTheme>;

/**
 * A placeholder slot for exercise/session demo media. No video library
 * is installed and no video assets exist in the project — this marks
 * where one would go, the same "ready for it, not wired up" convention
 * IMPLEMENTATION_PLAN.md already uses for audio (every session Block
 * carries an unused `audio` field). Don't wire real playback here
 * without adding expo-video and real assets first.
 */
export function DemoPlaceholder({
  theme,
  label,
  height = 200,
  minimized = false,
  onPress,
  overlay,
  flushTop = false,
}: {
  theme: Theme;
  label: string;
  height?: number;
  minimized?: boolean;
  onPress?: () => void;
  /** Absolutely-positioned content (a level chip, a close button…) layered on top. */
  overlay?: ReactNode;
  /** Drop this slot's own top corners/border — for when it sits flush against a card's top edge, and the card itself clips the rounding. */
  flushTop?: boolean;
}) {
  if (minimized) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: pressed ? theme.border : theme.surfaceRaised,
        })}
      >
        <PlayGlyph size={34} theme={theme} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[type.bodySmall, { color: theme.textPrimary }]}>Demo minimised</Text>
          <Text style={[type.mono, { color: theme.textTertiary }]}>TAP TO EXPAND</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={{
        height,
        borderRadius: flushTop ? 0 : radius.lg,
        overflow: 'hidden',
        backgroundColor: theme.surfaceRaised,
        borderWidth: flushTop ? 0 : 1,
        borderColor: theme.border,
      }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <PlayGlyph size={52} theme={theme} />
        <Text style={[type.mono, { color: theme.textTertiary }]}>{label}</Text>
      </View>
      {overlay}
    </Pressable>
  );
}

function PlayGlyph({ size, theme }: { size: number; theme: Theme }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: `${theme.textPrimary}4D`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 0,
          height: 0,
          marginLeft: size * 0.08,
          borderTopWidth: size * 0.2,
          borderBottomWidth: size * 0.2,
          borderLeftWidth: size * 0.32,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: `${theme.textPrimary}CC`,
        }}
      />
    </View>
  );
}

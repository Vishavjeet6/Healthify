import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { type, useTheme } from '../theme';

const SIZE = 190;
const RESTING_SCALE = 0.58;

type Theme = ReturnType<typeof useTheme>;

/**
 * The trainer's contract/release counter (redesign 1c): an orb that
 * expands on squeeze and settles on release, so the motion carries the
 * instruction and the numeral/label stay legible on their own — see
 * HANDOFF.md #5 (reduced-motion gating is a separate, not-yet-built
 * pass; this keeps text independently readable so that pass doesn't
 * have to redesign the screen).
 *
 * Scale is driven by the phase's *real* duration (level-dependent —
 * L1 3s/6s up to L4 10s/10s), not a fixed loop, so it stays in sync
 * with the second-by-second countdown at every level.
 */
export function OrbCounter({
  phase,
  secondsLeft,
  phaseDurationS,
  theme,
}: {
  phase: 'contract' | 'release';
  secondsLeft: number;
  phaseDurationS: number;
  theme: Theme;
}) {
  const scale = useSharedValue(phase === 'contract' ? RESTING_SCALE : 1);

  useEffect(() => {
    scale.value = withTiming(phase === 'contract' ? 1 : RESTING_SCALE, {
      duration: Math.max(phaseDurationS, 0.4) * 1000,
      easing: Easing.bezier(0.45, 0, 0.35, 1),
    });
    // Deliberately excludes secondsLeft: this should tween once across
    // the whole phase, not restart every second-tick re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, phaseDurationS]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const fill = phase === 'contract' ? theme.accent : theme.caution;
  const onFill = phase === 'contract' ? theme.accentOn : theme.cautionOn;
  const label = phase === 'contract' ? 'SQUEEZE' : 'RELEASE';

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { borderColor: `${theme.textPrimary}17` }]} />
      <Animated.View style={[styles.orb, { backgroundColor: fill, shadowColor: fill }, orbStyle]} />
      <View style={styles.center} pointerEvents="none">
        <Text style={[type.mono, { color: onFill, letterSpacing: 2 }]}>{label}</Text>
        <Text
          style={[
            type.displayLg,
            { color: onFill, fontVariant: ['tabular-nums'], lineHeight: 44, marginTop: 2 },
          ]}
        >
          {secondsLeft}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  track: {
    position: 'absolute',
    width: SIZE - 18,
    height: SIZE - 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  orb: {
    position: 'absolute',
    width: SIZE - 40,
    height: SIZE - 40,
    borderRadius: 999,
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
});

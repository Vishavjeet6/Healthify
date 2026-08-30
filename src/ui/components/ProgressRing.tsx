import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 220;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * progress: 0..1. durationMs: how long the fill/empty animation should
 * take, matched to the caller's hold/rest phase length.
 */
export function ProgressRing({
  progress,
  durationMs,
  trackColor,
  fillColor,
  children,
}: {
  progress: number;
  durationMs: number;
  trackColor: string;
  fillColor: string;
  children?: React.ReactNode;
}) {
  const animated = useSharedValue(progress);

  useEffect(() => {
    animated.value = withTiming(progress, { duration: durationMs, easing: Easing.linear });
  }, [progress, durationMs]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - animated.value),
  }));

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={trackColor}
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={fillColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          originX={SIZE / 2}
          originY={SIZE / 2}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});

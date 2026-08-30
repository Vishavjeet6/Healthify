import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { spacing, type, useTheme } from '../theme';

const WIDTH = 320;
const HEIGHT = 160;
const PAD = 24;
const MAX_SCORE = 25;

export function TrendChart({
  points,
  mcid,
}: {
  points: { date: string; score: number }[];
  mcid: number;
}) {
  const theme = useTheme();

  if (points.length === 0) return null;

  const baseline = points[0].score;
  const mcidLine = Math.min(baseline + mcid, MAX_SCORE);

  const x = (i: number) =>
    points.length === 1 ? PAD : PAD + (i / (points.length - 1)) * (WIDTH - PAD * 2);
  const y = (score: number) => HEIGHT - PAD - (score / MAX_SCORE) * (HEIGHT - PAD * 2);

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.score)}`).join(' ');

  return (
    <View style={{ gap: spacing.sm }}>
      <Svg width={WIDTH} height={HEIGHT}>
        <Line
          x1={PAD}
          y1={y(mcidLine)}
          x2={WIDTH - PAD}
          y2={y(mcidLine)}
          stroke={theme.caution}
          strokeDasharray="4,4"
          strokeWidth={1.5}
        />
        <SvgText x={WIDTH - PAD} y={y(mcidLine) - 6} fill={theme.caution} fontSize={10} textAnchor="end">
          Meaningful change
        </SvgText>
        <Path d={pathD} stroke={theme.accent} strokeWidth={2.5} fill="none" />
        {points.map((p, i) => (
          <Circle key={p.date} cx={x(i)} cy={y(p.score)} r={4} fill={theme.accent} />
        ))}
      </Svg>
      <Text style={[type.caption, { color: theme.textTertiary }]}>
        Baseline {baseline} → latest {points[points.length - 1].score}
      </Text>
    </View>
  );
}

import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { ProgressRing } from '../../ui/components/ProgressRing';
import { Button } from '../../ui/components/Button';
import { spacing, type, useTheme } from '../../ui/theme';
import type { Block } from '../../content/schema';

type BreathingBlockType = Extract<Block, { kind: 'breathing' }>;

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdOut';
const PHASE_ORDER: Phase[] = ['inhale', 'hold', 'exhale', 'holdOut'];
const PHASE_LABEL: Record<Phase, string> = {
  inhale: 'Breathe in',
  hold: 'Hold',
  exhale: 'Breathe out',
  holdOut: 'Hold',
};

export function BreathingBlock({ block, onDone }: { block: BreathingBlockType; onDone: () => void }) {
  const theme = useTheme();
  const [started, setStarted] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const phase = PHASE_ORDER[phaseIdx];
  const phaseDuration = block.pattern[phase];

  useEffect(() => {
    if (!started) return;
    if (phaseDuration === 0) {
      advance();
      return;
    }
    setSecondsLeft(phaseDuration);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          advance();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, phaseIdx, cycle]);

  function advance() {
    if (phaseIdx + 1 < PHASE_ORDER.length) {
      // skip zero-length phases
      let next = phaseIdx + 1;
      while (next < PHASE_ORDER.length && block.pattern[PHASE_ORDER[next]] === 0) next++;
      if (next < PHASE_ORDER.length) {
        setPhaseIdx(next);
        return;
      }
    }
    if (cycle + 1 >= block.cycles) {
      onDone();
      return;
    }
    setCycle(cycle + 1);
    setPhaseIdx(0);
  }

  if (!started) {
    return (
      <View style={{ gap: spacing.md, alignItems: 'center' }}>
        <Text style={[type.title, { color: theme.textPrimary }]}>{block.label}</Text>
        <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
          {block.cycles} slow cycles
        </Text>
        <Button theme={theme} label="Begin" onPress={() => setStarted(true)} />
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', gap: spacing.lg }}>
      <ProgressRing
        progress={phaseDuration === 0 ? 0 : 1 - secondsLeft / phaseDuration}
        durationMs={1000}
        trackColor={theme.border}
        fillColor={theme.accent}
      >
        <Text style={[type.displayLg, { color: theme.textPrimary, fontVariant: ['tabular-nums'] }]}>
          {secondsLeft}
        </Text>
        <Text style={[type.caption, { color: theme.textTertiary }]}>{PHASE_LABEL[phase]}</Text>
      </ProgressRing>
      <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
        Cycle {cycle + 1} of {block.cycles}
      </Text>
    </View>
  );
}

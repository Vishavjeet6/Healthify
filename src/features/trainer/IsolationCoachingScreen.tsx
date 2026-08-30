import { Text, View } from 'react-native';

import { Button } from '../../ui/components/Button';
import { spacing, type, useTheme } from '../../ui/theme';

/**
 * Shown once, before a user's very first timed set — free, ungated by
 * the paywall or the program. Most pelvic floor apps skip straight to
 * timed contractions and their users end up training the wrong muscle
 * for weeks; this is the fix. See IMPLEMENTATION_PLAN.md feature 4,
 * "Isolation coaching first."
 */
export function IsolationCoachingScreen({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[type.title, { color: theme.textPrimary }]}>Finding the muscle</Text>
      <Text style={[type.body, { color: theme.textSecondary, lineHeight: 24 }]}>
        Before your first set: next time you're urinating, try to stop the flow partway through,
        then let it go again. The muscle that does that is the one you're about to train. Don't
        make this a habit during urination itself — it's a one-time locator, not a drill.
      </Text>
      <Text style={[type.body, { color: theme.textSecondary, lineHeight: 24 }]}>
        Once you can feel it: it's a lift-and-squeeze, roughly between your sit bones. Your
        stomach, thighs, and glutes should stay relaxed — if your whole body is tensing, that's
        the wrong muscle.
      </Text>
      <Text style={[type.bodySmall, { color: theme.textTertiary }]}>
        If nothing feels distinct yet, that's common — start anyway. It gets clearer with
        practice, and the sets below will still help you find it.
      </Text>
      <Button theme={theme} label="I've got it, continue" onPress={onDone} />
    </View>
  );
}

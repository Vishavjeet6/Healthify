import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { track } from '../src/features/analytics';
import { useEntitlement } from '../src/features/paywall/useEntitlement';
import type { Offering } from '../src/features/paywall/types';
import { Button } from '../src/ui/components/Button';
import { Card } from '../src/ui/components/Card';
import { Screen } from '../src/ui/components/Screen';
import { radius, spacing, type, useTheme } from '../src/ui/theme';

export default function Paywall() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { provider, refresh } = useEntitlement();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    track(db, 'paywall_viewed');
    provider.getOfferings().then((o) => {
      setOfferings(o);
      setSelected(o.find((x) => x.period === 'yearly')?.packageId ?? o[0]?.packageId ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePurchase() {
    if (!selected) return;
    setPurchasing(true);
    await provider.purchase(selected);
    await track(db, 'purchase_completed', { packageId: selected });
    await refresh();
    setPurchasing(false);
    router.back();
  }

  return (
    <Screen>
      <View style={{ gap: spacing.sm }}>
        <Text style={[type.displayMd, { color: theme.textPrimary }]}>Full membership</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>
          The complete 12-week program, the full mindfulness and reflection library, session
          history, and your score trend over time.
        </Text>
      </View>

      <View style={{ gap: spacing.sm }}>
        {offerings.map((o) => (
          <Pressable
            key={o.packageId}
            onPress={() => setSelected(o.packageId)}
            style={{
              borderWidth: 1,
              borderColor: selected === o.packageId ? theme.accent : theme.border,
              borderRadius: radius.md,
              padding: spacing.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: selected === o.packageId ? theme.surfaceRaised : theme.surface,
            }}
          >
            <Text style={[type.body, { color: theme.textPrimary }]}>{o.title}</Text>
            <Text style={[type.body, { color: theme.textSecondary }]}>{o.priceLabel}</Text>
          </Pressable>
        ))}
      </View>

      <Card theme={theme}>
        <Text style={[type.bodySmall, { color: theme.textSecondary }]}>
          7-day trial, then billed at the price shown. Cancel anytime from your device's
          subscription settings.
        </Text>
      </Card>

      <Button
        theme={theme}
        label={purchasing ? 'Starting trial…' : 'Start free trial'}
        disabled={!selected || purchasing}
        onPress={handlePurchase}
      />
      <Button
        theme={theme}
        variant="ghost"
        label="Restore purchase"
        onPress={async () => {
          await provider.restore();
          await refresh();
          router.back();
        }}
      />
    </Screen>
  );
}

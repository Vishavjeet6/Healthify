import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getSetting, setSetting } from '../../db/queries/settings';
import { onboardingPalettes, useTheme } from '../../ui/theme';

const VARIANT_KEY = 'onboarding_style';

export type OnboardingVariant = 'cool' | 'warm';

/**
 * Which onboarding treatment (redesign options 1a "cool" vs 1b "warm")
 * to render. Persisted so a mid-flow relaunch doesn't switch skins.
 * Only exposed as user-facing choice from the __DEV__ debug screen —
 * see settings/debug.tsx.
 */
export function useOnboardingVariant() {
  const db = useSQLiteContext();
  const [variant, setVariantState] = useState<OnboardingVariant>('cool');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getSetting(db, VARIANT_KEY);
      if (stored === 'warm' || stored === 'cool') setVariantState(stored);
      setLoaded(true);
    })();
  }, [db]);

  const setVariant = useCallback(
    async (next: OnboardingVariant) => {
      setVariantState(next);
      await setSetting(db, VARIANT_KEY, next);
    },
    [db],
  );

  return { variant, setVariant, loaded };
}

/**
 * Resolves the token set for the given onboarding variant. "Cool" is
 * just the app's normal (system-driven) theme; "warm" is a fixed
 * alternate palette regardless of light/dark system setting — see
 * theme.ts.
 */
export function useOnboardingTheme(variant: OnboardingVariant) {
  const systemTheme = useTheme();
  return variant === 'warm' ? onboardingPalettes.warm : systemTheme;
}

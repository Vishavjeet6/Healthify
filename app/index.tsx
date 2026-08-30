import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { View } from 'react-native';

import { getProfile } from '../src/db/queries/profile';
import { useTheme } from '../src/ui/theme';

/** Boot router: onboarding vs Today, decided once per launch. */
export default function Index() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const profile = await getProfile(db);
      setTarget(profile?.onboardingComplete ? '/(app)/today' : '/(onboarding)/welcome');
    })();
  }, [db]);

  if (!target) {
    return <View style={{ flex: 1, backgroundColor: theme.ground }} />;
  }

  return <Redirect href={target as any} />;
}

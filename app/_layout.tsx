import { Newsreader_500Medium, Newsreader_600SemiBold } from '@expo-google-fonts/newsreader';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { DATABASE_NAME } from '../src/db/schema';
import { runMigrations } from '../src/db/migrations';
import { ensureProfile } from '../src/db/queries/profile';
import { ensureProgramState } from '../src/db/queries/programState';
import { themes } from '../src/ui/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Newsreader_500Medium,
    Newsreader_600SemiBold,
  });
  const scheme = useColorScheme();
  const theme = scheme === 'light' ? themes.light : themes.dark;

  if (!fontsLoaded && !fontError) {
    return (
      <View style={[styles.boot, { backgroundColor: theme.ground }]}>
        <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          onInit={async (db) => {
            await runMigrations(db);
            await ensureProfile(db);
            await ensureProgramState(db);
          }}
          onError={(error) => {
            // Surface loudly rather than blank-screening — a failed
            // migration or profile write must not fail silently.
            console.error('[db:init]', error);
            throw error;
          }}
          useSuspense={false}
        >
          <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.ground } }}>
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="session/[id]" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="trainer/run" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
            <Stack.Screen name="assessment-retake" options={{ presentation: 'fullScreenModal' }} />
          </Stack>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  boot: { flex: 1 },
});

import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { useTheme } from '../../src/ui/theme';

function TabIcon({ symbol, color }: { symbol: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{symbol}</Text>;
}

export default function AppTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: 'Today', tabBarIcon: ({ color }) => <TabIcon symbol="●" color={color} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ color }) => <TabIcon symbol="▲" color={color} /> }}
      />
      <Tabs.Screen
        name="trainer/index"
        options={{ title: 'Trainer', tabBarIcon: ({ color }) => <TabIcon symbol="◐" color={color} /> }}
      />
      <Tabs.Screen
        name="learn/index"
        options={{ title: 'Learn', tabBarIcon: ({ color }) => <TabIcon symbol="□" color={color} /> }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{ title: 'Settings', tabBarIcon: ({ color }) => <TabIcon symbol="⋯" color={color} /> }}
      />
      <Tabs.Screen name="learn/[slug]" options={{ href: null }} />
      <Tabs.Screen name="settings/backup" options={{ href: null }} />
      <Tabs.Screen name="settings/privacy" options={{ href: null }} />
      <Tabs.Screen name="settings/debug" options={{ href: null }} />
    </Tabs>
  );
}

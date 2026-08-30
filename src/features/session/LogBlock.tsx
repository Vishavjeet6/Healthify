import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, Text, View } from 'react-native';

import { upsertTodayLog } from '../../db/queries/dailyLogs';
import type { Block } from '../../content/schema';
import { Button } from '../../ui/components/Button';
import { radius, spacing, type, useTheme } from '../../ui/theme';

type LogBlockType = Extract<Block, { kind: 'log' }>;

const FIELD_LABEL: Record<LogBlockType['fields'][number], string> = {
  sleep: 'Hours slept',
  alcohol: 'Drinks',
  morningErection: 'Morning erection',
};

export function LogBlock({ block, onDone }: { block: LogBlockType; onDone: () => void }) {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [values, setValues] = useState<Record<string, number | boolean>>({});

  async function submit() {
    await upsertTodayLog(db, {
      morningErection: typeof values.morningErection === 'boolean' ? values.morningErection : undefined,
      sleepHours: typeof values.sleep === 'number' ? values.sleep : undefined,
      drinks: typeof values.alcohol === 'number' ? values.alcohol : undefined,
    });
    onDone();
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[type.title, { color: theme.textPrimary }]}>Quick log</Text>
      {block.fields.map((field) => (
        <View key={field} style={{ gap: spacing.sm }}>
          <Text style={[type.body, { color: theme.textPrimary }]}>{FIELD_LABEL[field]}</Text>
          {field === 'morningErection' ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Chip
                theme={theme}
                label="Yes"
                selected={values.morningErection === true}
                onPress={() => setValues((v) => ({ ...v, morningErection: true }))}
              />
              <Chip
                theme={theme}
                label="No"
                selected={values.morningErection === false}
                onPress={() => setValues((v) => ({ ...v, morningErection: false }))}
              />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {[0, 1, 2, 3, 4].map((n) => (
                <Chip
                  key={n}
                  theme={theme}
                  label={String(n)}
                  selected={values[field] === n}
                  onPress={() => setValues((v) => ({ ...v, [field]: n }))}
                />
              ))}
            </View>
          )}
        </View>
      ))}
      <Button theme={theme} label="Continue" onPress={submit} />
    </View>
  );
}

function Chip({
  theme,
  label,
  selected,
  onPress,
}: {
  theme: ReturnType<typeof useTheme>;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: selected ? theme.accent : theme.border,
        backgroundColor: selected ? theme.accent : 'transparent',
        borderRadius: radius.pill,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      }}
    >
      <Text style={{ color: selected ? theme.accentOn : theme.textPrimary }}>{label}</Text>
    </Pressable>
  );
}

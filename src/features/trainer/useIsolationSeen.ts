import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getSetting, setSetting } from '../../db/queries/settings';

const KEY = 'pf_isolation_seen';

export function useIsolationSeen() {
  const db = useSQLiteContext();
  const [seen, setSeen] = useState<boolean | null>(null); // null = loading

  const refresh = useCallback(async () => {
    setSeen((await getSetting(db, KEY)) === 'true');
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function markSeen() {
    await setSetting(db, KEY, 'true');
    setSeen(true);
  }

  return { seen, markSeen };
}

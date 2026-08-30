import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { MockPurchaseProvider } from './MockPurchaseProvider';
import type { Entitlement } from './types';

/**
 * Single gating hook — checked at route boundaries, never scattered
 * through components. See IMPLEMENTATION_PLAN.md Work item 8.
 */
export function useEntitlement() {
  const db = useSQLiteContext();
  const [entitlement, setEntitlement] = useState<Entitlement>({ active: false, source: 'mock' });
  const [loading, setLoading] = useState(true);

  const provider = new MockPurchaseProvider(db);

  const refresh = useCallback(async () => {
    const e = await provider.getEntitlement();
    setEntitlement(e);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entitlement, loading, refresh, provider };
}

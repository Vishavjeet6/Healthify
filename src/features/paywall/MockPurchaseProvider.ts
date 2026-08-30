import type { SQLiteDatabase } from 'expo-sqlite';

import { getSetting, setSetting } from '../../db/queries/settings';
import type { Entitlement, Offering, PurchaseProvider } from './types';
import { OFFERINGS } from './types';

const SETTINGS_KEY = 'mock_entitlement_active';

/**
 * Persists to `settings` so entitlement survives restarts without a
 * backend. See IMPLEMENTATION_PLAN.md Work item 8 — this is the only
 * provider in the MVP; RevenueCatPurchaseProvider is a same-interface
 * drop-in once store accounts exist, with no call-site changes.
 */
export class MockPurchaseProvider implements PurchaseProvider {
  constructor(private db: SQLiteDatabase) {}

  async init(): Promise<void> {
    // no-op: nothing to warm up for the mock
  }

  async getOfferings(): Promise<Offering[]> {
    return OFFERINGS;
  }

  async purchase(packageId: string): Promise<Entitlement> {
    await setSetting(this.db, SETTINGS_KEY, 'true');
    return this.getEntitlement();
  }

  async restore(): Promise<Entitlement> {
    return this.getEntitlement();
  }

  async getEntitlement(): Promise<Entitlement> {
    const active = (await getSetting(this.db, SETTINGS_KEY)) === 'true';
    return { active, source: 'mock', productId: active ? 'yearly_99' : undefined };
  }

  /** Debug-screen only (Work item 8's __DEV__ toggle). */
  async setActiveForDebug(active: boolean): Promise<void> {
    await setSetting(this.db, SETTINGS_KEY, active ? 'true' : 'false');
  }
}

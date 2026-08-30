export type SyncStatus = 'off' | 'pending' | 'synced' | 'error';

export interface SyncProvider {
  isOptedIn(): Promise<boolean>;
  optIn(email: string): Promise<void>;
  optOut(): Promise<void>;
  getStatus(): Promise<SyncStatus>;
  /** Pushes queued rows. One-way, last-write-wins, single device — see plan. */
  flush(): Promise<void>;
}

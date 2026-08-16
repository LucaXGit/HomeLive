import {
  MockSyncTransport,
} from '../data/remote/MockSyncTransport';

import {
  SyncService,
} from './syncService';

const transport = new MockSyncTransport();
const syncService = new SyncService(transport);

export async function runSync(): Promise<void> {
  await syncService.processQueue();
}

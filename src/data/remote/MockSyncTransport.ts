import {
  SyncTransport,
} from '../../services/syncService';

import {
  SyncOperation,
} from '../../types/SyncOperation';

export class MockSyncTransport
  implements SyncTransport
{
  async send(
    operation: SyncOperation
  ): Promise<void> {
    console.log(
      'MOCK SYNC:',
      operation.entityType,
      operation.operation,
      operation.entityId
    );
  }
}

import {
  getPendingSyncOperations,
  markSyncOperationError,
  markSyncOperationProcessing,
  removeSyncOperation,
} from '../data/local/syncQueue';

import {
  updateEntitySyncStatus,
} from '../data/local/entitySyncStatus';

import {
  SyncOperation,
} from '../types/SyncOperation';

export interface SyncTransport {
  send(operation: SyncOperation): Promise<void>;
}

export class SyncService {
  constructor(
    private readonly transport: SyncTransport
  ) {}

  async processQueue(): Promise<void> {
    const operations =
      await getPendingSyncOperations();

    for (const operation of operations) {
      await this.processOperation(operation);
    }
  }

  private async processOperation(
    operation: SyncOperation
  ): Promise<void> {
    try {
      await markSyncOperationProcessing(operation.id);
      await this.transport.send(operation);

      if (operation.operation !== 'delete') {
        await updateEntitySyncStatus(
          operation.entityType,
          operation.entityId,
          'synced'
        );
      }

      await removeSyncOperation(operation.id);
    } catch (error) {
      await markSyncOperationError(operation.id);

      if (operation.operation !== 'delete') {
        try {
          await updateEntitySyncStatus(
            operation.entityType,
            operation.entityId,
            'error'
          );
        } catch (statusError) {
          console.error(
            'No fue posible actualizar sync_status:',
            statusError
          );
        }
      }

      console.error(
        'Sync operation failed:',
        operation.entityType,
        operation.entityId,
        operation.operation,
        error
      );
    }
  }
}

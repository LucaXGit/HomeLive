import { getDatabase } from './database';

import {
  SyncOperation,
} from '../../types/SyncOperation';

interface SyncQueueRow {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: SyncOperation['operation'];
  payload: string | null;
  status: SyncOperation['status'];
  attempts: number;
  created_at: string;
  updated_at: string;
}

function rowToSyncOperation(
  row: SyncQueueRow
): SyncOperation {
  return {
    id: row.id,
    entityType: row.entity_type as SyncOperation['entityType'],
    entityId: row.entity_id,
    operation: row.operation,
    payload: row.payload ?? undefined,
    status: row.status,
    attempts: row.attempts,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function enqueueSyncOperation(
  entityType: SyncOperation['entityType'],
  entityId: string,
  operation: SyncOperation['operation'],
  payload?: unknown
): Promise<SyncOperation> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const payloadText =
    payload === undefined
      ? undefined
      : JSON.stringify(payload);

  const existingRows =
    await db.getAllAsync<SyncQueueRow>(
      `
        SELECT *
        FROM sync_queue
        WHERE entity_type = ?
          AND entity_id = ?
          AND status IN (
            'pending',
            'error'
          )
        ORDER BY created_at ASC
      `,
      entityType,
      entityId
    );

  if (existingRows.length > 0) {
    const latest =
      existingRows[
        existingRows.length - 1
      ];

    if (
      latest.operation === 'delete'
    ) {
      return rowToSyncOperation(latest);
    }

    let finalOperation:
      SyncOperation['operation'];
    let finalPayload =
      payloadText ??
      latest.payload ??
      undefined;

    if (
      latest.operation === 'create'
    ) {
      if (operation === 'delete') {
        await db.runAsync(
          `
            DELETE FROM sync_queue
            WHERE entity_type = ?
              AND entity_id = ?
              AND status IN (
                'pending',
                'error'
              )
          `,
          entityType,
          entityId
        );

        return {
          id: latest.id,
          entityType,
          entityId,
          operation: 'delete',
          payload: finalPayload,
          status: 'pending',
          attempts: 0,
          createdAt: latest.created_at,
          updatedAt: now,
        };
      }

      finalOperation = 'create';
    } else if (
      latest.operation === 'update'
    ) {
      if (operation === 'delete') {
        finalOperation = 'delete';
      } else if (
        operation === 'create'
      ) {
        finalOperation = 'create';
      } else {
        finalOperation = 'update';
      }
    } else {
      finalOperation = operation;
    }

    if (
      finalOperation === 'delete' &&
      latest.operation === 'create'
    ) {
      await db.runAsync(
        `
          DELETE FROM sync_queue
          WHERE entity_type = ?
            AND entity_id = ?
            AND status IN (
              'pending',
              'error'
            )
        `,
        entityType,
        entityId
      );

      return {
        id: latest.id,
        entityType,
        entityId,
        operation: 'delete',
        payload: finalPayload,
        status: 'pending',
        attempts: 0,
        createdAt: latest.created_at,
        updatedAt: now,
      };
    }

    await db.runAsync(
      `
        DELETE FROM sync_queue
        WHERE entity_type = ?
          AND entity_id = ?
          AND status IN (
            'pending',
            'error'
          )
      `,
      entityType,
      entityId
    );

    const syncOperation: SyncOperation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      entityType,
      entityId,
      operation: finalOperation,
      payload: finalPayload,
      status: 'pending',
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      `
        INSERT INTO sync_queue (
          id,
          entity_type,
          entity_id,
          operation,
          payload,
          status,
          attempts,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      syncOperation.id,
      syncOperation.entityType,
      syncOperation.entityId,
      syncOperation.operation,
      syncOperation.payload ?? null,
      syncOperation.status,
      syncOperation.attempts,
      syncOperation.createdAt,
      syncOperation.updatedAt
    );

    return syncOperation;
  }

  const syncOperation: SyncOperation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    entityType,
    entityId,
    operation,
    payload: payloadText,
    status: 'pending',
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `
      INSERT INTO sync_queue (
        id,
        entity_type,
        entity_id,
        operation,
        payload,
        status,
        attempts,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    syncOperation.id,
    syncOperation.entityType,
    syncOperation.entityId,
    syncOperation.operation,
    payloadText ?? null,
    syncOperation.status,
    syncOperation.attempts,
    syncOperation.createdAt,
    syncOperation.updatedAt
  );

  return syncOperation;
}

export async function getPendingSyncOperations():
  Promise<SyncOperation[]> {
  const db = await getDatabase();

  const rows =
    await db.getAllAsync<SyncQueueRow>(
      `
        SELECT *
        FROM sync_queue
        WHERE status IN (
          'pending',
          'error'
        )
        ORDER BY created_at ASC
      `
    );

  return rows.map(rowToSyncOperation);
}

export async function markSyncOperationProcessing(
  id: string
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE sync_queue
      SET
        status = 'processing',
        updated_at = ?
      WHERE id = ?
    `,
    new Date().toISOString(),
    id
  );
}

export async function markSyncOperationError(
  id: string
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
      UPDATE sync_queue
      SET
        status = 'error',
        attempts = attempts + 1,
        updated_at = ?
      WHERE id = ?
    `,
    new Date().toISOString(),
    id
  );
}

export async function removeSyncOperation(
  id: string
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `
      DELETE FROM sync_queue
      WHERE id = ?
    `,
    id
  );
}

export async function debugSyncQueue(): Promise<void> {
  const db = await getDatabase();
  const rows =
    await db.getAllAsync(
      `
        SELECT
          entity_type,
          entity_id,
          operation,
          status,
          payload
        FROM sync_queue
        ORDER BY created_at ASC
      `
    );

  console.log(
    'SYNC QUEUE:',
    JSON.stringify(rows, null, 2)
  );
}

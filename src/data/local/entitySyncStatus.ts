import {
  SyncEntityType,
} from '../../types/SyncOperation';

import {
  SyncStatus,
} from '../../types/SyncStatus';

import {
  getDatabase,
} from './database';

function getTableName(
  entityType: SyncEntityType
): string {
  switch (entityType) {
    case 'user':
      return 'users';
    case 'household':
      return 'households';
    case 'product':
      return 'products';
    case 'shopping_list':
      return 'shopping_lists';
    case 'shopping_item':
      return 'shopping_items';
    case 'financial_transaction':
      return 'financial_transactions';
    case 'savings_goal':
      return 'savings_goals';
    case 'planning_item':
      return 'planning_items';
    default: {
      const exhaustiveCheck: never = entityType;
      throw new Error(
        `Entidad de sincronización no soportada: ${exhaustiveCheck}`
      );
    }
  }
}

export async function updateEntitySyncStatus(
  entityType: SyncEntityType,
  entityId: string,
  status: SyncStatus
): Promise<void> {
  const db = await getDatabase();
  const tableName = getTableName(entityType);

  await db.runAsync(
    `
      UPDATE ${tableName}
      SET sync_status = ?
      WHERE id = ?
    `,
    status,
    entityId
  );
}

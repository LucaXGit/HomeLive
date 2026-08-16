import {
  getDatabase,
} from './database';

import {
  getStoredShoppingLists,
} from './shoppingListStorage';

const MIGRATION_KEY =
  'shopping_lists_asyncstorage_migrated';

export async function migrateShoppingListsToSQLite():
  Promise<void> {
  const db = await getDatabase();

  const lists =
    await getStoredShoppingLists();

  await db.withTransactionAsync(
    async () => {
      for (const list of lists) {
        await db.runAsync(
          `
            INSERT INTO shopping_lists (
              id,
              household_id,
              name,
              date,
              status,
              created_by,
              created_at,
              updated_at,
              sync_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id)
            DO UPDATE SET
              household_id = excluded.household_id,
              name = excluded.name,
              date = excluded.date,
              status = excluded.status,
              created_by = excluded.created_by,
              created_at = excluded.created_at,
              updated_at = excluded.updated_at,
              sync_status = excluded.sync_status
          `,
          list.id,
          list.householdId,
          list.name,
          list.date,
          list.status,
          list.createdBy,
          list.createdAt,
          list.updatedAt,
          'pending'
        );

        for (
          const item of list.items
        ) {
          const itemTimestamp =
            list.updatedAt ||
            list.createdAt ||
            new Date().toISOString();

          await db.runAsync(
            `
              INSERT INTO shopping_items (
                id,
                shopping_list_id,
                name,
                quantity,
                unit,
                status,
                created_at,
                updated_at,
                sync_status
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id)
              DO UPDATE SET
                shopping_list_id = excluded.shopping_list_id,
                name = excluded.name,
                quantity = excluded.quantity,
                unit = excluded.unit,
                status = excluded.status,
                created_at = excluded.created_at,
                updated_at = excluded.updated_at,
                sync_status = excluded.sync_status
            `,
            item.id,
            list.id,
            item.name,
            item.quantity,
            item.unit ?? null,
            item.status,
            itemTimestamp,
            itemTimestamp,
            'pending'
          );
        }
      }

      await db.runAsync(
        `
          INSERT OR REPLACE INTO app_metadata (
            key,
            value
          )
          VALUES (?, ?)
        `,
        MIGRATION_KEY,
        'true'
      );
    }
  );
}
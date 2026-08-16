import {
  getDatabase,
} from './database';

import {
  getStoredPlanningItems,
} from './planningStorage';

const MIGRATION_KEY =
  'planning_items_asyncstorage_migrated';

export async function migratePlanningItemsToSQLite():
  Promise<void> {
  const db = await getDatabase();

  const items =
    await getStoredPlanningItems();

  await db.withTransactionAsync(
    async () => {
      for (const item of items) {
        await db.runAsync(
          `
            INSERT INTO planning_items (
              id,
              household_id,
              user_id,
              title,
              description,
              type,
              date,
              completed,
              created_at,
              updated_at,
              sync_status
            )
            VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            ON CONFLICT(id)
            DO UPDATE SET
              household_id = excluded.household_id,
              user_id = excluded.user_id,
              title = excluded.title,
              description = excluded.description,
              type = excluded.type,
              date = excluded.date,
              completed = excluded.completed,
              created_at = excluded.created_at,
              updated_at = excluded.updated_at,
              sync_status = excluded.sync_status
          `,
          item.id,
          item.householdId,
          item.userId,
          item.title,
          item.description ?? null,
          item.type,
          item.date,
          item.completed ? 1 : 0,
          item.createdAt,
          item.updatedAt,
          'pending'
        );
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

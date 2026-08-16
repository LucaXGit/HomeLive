import {
  getDatabase,
} from './database';

import {
  getStoredSavingsGoals,
} from './savingsGoalStorage';

const MIGRATION_KEY =
  'savings_goals_asyncstorage_migrated';

export async function migrateSavingsGoalsToSQLite():
  Promise<void> {
  const db = await getDatabase();

  const goals =
    await getStoredSavingsGoals();

  await db.withTransactionAsync(
    async () => {
      for (const goal of goals) {
        await db.runAsync(
          `
            INSERT INTO savings_goals (
              id,
              household_id,
              name,
              target_amount,
              saved_amount,
              target_date,
              status,
              created_at,
              updated_at,
              sync_status
            )
            VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            ON CONFLICT(id)
            DO UPDATE SET
              household_id = excluded.household_id,
              name = excluded.name,
              target_amount = excluded.target_amount,
              saved_amount = excluded.saved_amount,
              target_date = excluded.target_date,
              status = excluded.status,
              created_at = excluded.created_at,
              updated_at = excluded.updated_at,
              sync_status = excluded.sync_status
          `,
          goal.id,
          goal.householdId,
          goal.name,
          goal.targetAmount,
          goal.savedAmount,
          goal.targetDate ?? null,
          goal.status,
          goal.createdAt,
          goal.updatedAt,
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

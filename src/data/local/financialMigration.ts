import {
  getDatabase,
} from './database';

import {
  getStoredFinancialTransactions,
} from './financialStorage';

const MIGRATION_KEY =
  'financial_transactions_asyncstorage_migrated';

export async function migrateFinancialTransactionsToSQLite():
  Promise<void> {
  const db = await getDatabase();

  const transactions =
    await getStoredFinancialTransactions();

  await db.withTransactionAsync(
    async () => {
      for (const transaction of transactions) {
        await db.runAsync(
          `
            INSERT INTO financial_transactions (
              id,
              household_id,
              user_id,
              type,
              amount,
              category,
              payment_method,
              date,
              description,
              created_at,
              updated_at,
              sync_status
            )
            VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            ON CONFLICT(id)
            DO UPDATE SET
              household_id = excluded.household_id,
              user_id = excluded.user_id,
              type = excluded.type,
              amount = excluded.amount,
              category = excluded.category,
              payment_method = excluded.payment_method,
              date = excluded.date,
              description = excluded.description,
              created_at = excluded.created_at,
              updated_at = excluded.updated_at,
              sync_status = excluded.sync_status
          `,
          transaction.id,
          transaction.householdId,
          transaction.userId,
          transaction.type,
          transaction.amount,
          transaction.category,
          transaction.paymentMethod,
          transaction.date,
          transaction.description ?? null,
          transaction.createdAt,
          transaction.updatedAt,
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

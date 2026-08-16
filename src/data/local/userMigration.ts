import {
  getDatabase,
} from './database';

import {
  getStoredUsers,
} from './authStorage';

export async function migrateUsersToSQLite():
  Promise<void> {
  const db = await getDatabase();

  const users =
    await getStoredUsers();

  await db.withTransactionAsync(
    async () => {
      for (const storedUser of users) {
        const now =
          new Date().toISOString();

        await db.runAsync(
          `
            INSERT INTO users (
              id,
              first_name,
              last_name,
              email,
              household_id,
              created_at,
              updated_at,
              sync_status
            )
            VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?
            )

            ON CONFLICT(id)
            DO UPDATE SET
              first_name =
                excluded.first_name,
              last_name =
                excluded.last_name,
              email =
                excluded.email,
              household_id =
                excluded.household_id,
              updated_at =
                excluded.updated_at,
              sync_status =
                excluded.sync_status
          `,
          storedUser.id,
          storedUser.firstName,
          storedUser.lastName,
          storedUser.email,
          storedUser.householdId ?? null,
          storedUser.createdAt ?? now,
          storedUser.updatedAt ?? now,
          'pending'
        );
      }
    }
  );
}
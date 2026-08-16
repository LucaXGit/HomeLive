import {
  getDatabase,
} from './database';

import {
  getStoredHouseholds,
} from './householdStorage';

export async function migrateHouseholdMembersToSQLite():
  Promise<void> {
  const db = await getDatabase();

  const households =
    await getStoredHouseholds();

  await db.withTransactionAsync(
    async () => {
      for (const household of households) {
        for (
          const userId of
          household.memberIds
        ) {
          await db.runAsync(
            `
              INSERT OR IGNORE INTO household_members (
                household_id,
                user_id,
                created_at
              )
              VALUES (?, ?, ?)
            `,
            household.id,
            userId,
            household.createdAt
          );
        }
      }
    }
  );
}
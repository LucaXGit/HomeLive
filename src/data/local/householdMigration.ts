import { getDatabase } from './database';
import { getStoredHouseholds } from './householdStorage';

const MIGRATION_KEY =
  'households_asyncstorage_migrated';

export async function migrateHouseholdsToSQLite():
  Promise<void> {
  const db = await getDatabase();

  const metadata =
    await db.getFirstAsync<{
      value: string;
    }>(
      `
        SELECT value
        FROM app_metadata
        WHERE key = ?
      `,
      MIGRATION_KEY
    );

  if (metadata?.value === 'true') {
    const householdCount =
      await db.getFirstAsync<{
        count: number;
      }>(
        `
        SELECT COUNT(*) AS count
        FROM households
        WHERE owner_id IS NOT NULL
      `
      );

    if (
      householdCount &&
      householdCount.count > 0
    ) {
      return;
    }
  }

  const households =
    await getStoredHouseholds();

  for (const household of households) {
    await db.runAsync(
      `
        INSERT INTO households (
          id,
          name,
          owner_id,
          created_at,
          updated_at,
          sync_status
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id)
        DO UPDATE SET
          name = excluded.name,
          owner_id = excluded.owner_id,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          sync_status = excluded.sync_status
      `,
      household.id,
      household.name,
      household.ownerId,
      household.createdAt,
      household.updatedAt,
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
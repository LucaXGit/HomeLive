import { User } from '../../domain/entities';
import { getDatabase } from './database';

export async function upsertUserInSQLite(
  user: User
): Promise<void> {
  const db = await getDatabase();

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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id)
      DO UPDATE SET
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        household_id = excluded.household_id,
        updated_at = excluded.updated_at
    `,
    user.id,
    user.firstName,
    user.lastName,
    user.email,
    user.householdId ?? null,
    user.createdAt,
    user.updatedAt,
    'pending'
  );
}

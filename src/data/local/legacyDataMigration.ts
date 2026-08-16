import { getDatabase } from './database';

import {
  migrateUsersToSQLite,
} from './userMigration';

import {
  migrateHouseholdsToSQLite,
} from './householdMigration';

import {
  migrateHouseholdMembersToSQLite,
} from './householdMemberMigration';

import {
  migrateProductsToSQLite,
} from './productMigration';

import {
  migrateShoppingListsToSQLite,
} from './shoppingListMigration';

import {
  migrateFinancialTransactionsToSQLite,
} from './financialMigration';

import {
  migrateSavingsGoalsToSQLite,
} from './savingsGoalMigration';

import {
  migratePlanningItemsToSQLite,
} from './planningMigration';

const LEGACY_MIGRATION_KEY =
  'legacy_asyncstorage_migration_completed';

export async function migrateLegacyData():
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
      LEGACY_MIGRATION_KEY
    );

  if (metadata?.value === 'true') {
    return;
  }

  await migrateUsersToSQLite();

  await migrateHouseholdsToSQLite();

  await migrateHouseholdMembersToSQLite();

  await migrateProductsToSQLite();

  await migrateShoppingListsToSQLite();

  await migrateFinancialTransactionsToSQLite();

  await migrateSavingsGoalsToSQLite();

  await migratePlanningItemsToSQLite();

  await db.runAsync(
    `
      INSERT OR REPLACE INTO app_metadata (
        key,
        value
      )
      VALUES (?, ?)
    `,
    LEGACY_MIGRATION_KEY,
    'true'
  );
}
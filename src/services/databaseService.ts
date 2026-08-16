import {
  initializeDatabase,
} from '../data/local/database';

import {
  runMigrations,
} from '../data/local/migrations';
import {
  migrateHouseholdsToSQLite,
} from '../data/local/householdMigration';
import {
  migrateProductsToSQLite,
} from '../data/local/productMigration';
import {
  migrateShoppingListsToSQLite,
} from '../data/local/shoppingListMigration';
import {
  migrateFinancialTransactionsToSQLite,
} from '../data/local/financialMigration';
import {
  migrateSavingsGoalsToSQLite,
} from '../data/local/savingsGoalMigration';
import {
  migratePlanningItemsToSQLite,
} from '../data/local/planningMigration';

let initialized = false;

export async function initializeLocalDatabase():
  Promise<void> {
  if (initialized) {
    return;
  }

  await initializeDatabase();

  await runMigrations();

  await migrateHouseholdsToSQLite();

  await migrateProductsToSQLite();

  await migrateShoppingListsToSQLite();

  await migrateFinancialTransactionsToSQLite();

  await migrateSavingsGoalsToSQLite();

  await migratePlanningItemsToSQLite();

  initialized = true;
}
import {
  initializeDatabase,
} from '../data/local/database';
import {
  runMigrations,
} from '../data/local/migrations';
import {
  migrateLegacyData,
} from '../data/local/legacyDataMigration';

let initialized = false;

export async function initializeLocalDatabase():
  Promise<void> {
  if (initialized) {
    return;
  }

  await initializeDatabase();
  await runMigrations();
  await migrateLegacyData();
  initialized = true;
}
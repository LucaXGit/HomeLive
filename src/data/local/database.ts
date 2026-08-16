import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'homelive.db';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase():
  Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  database =
    await SQLite.openDatabaseAsync(
      DATABASE_NAME
    );

  return database;
}

export async function initializeDatabase():
  Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);
}
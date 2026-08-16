import { getDatabase } from './database';

const DATABASE_VERSION = 8;

export async function runMigrations():
  Promise<void> {
  const db = await getDatabase();

  const result =
    await db.getFirstAsync<{
      user_version: number;
    }>(
      'PRAGMA user_version'
    );

  const currentVersion =
    result?.user_version ?? 0;

  if (
    currentVersion >=
    DATABASE_VERSION
  ) {
    return;
  }

  if (currentVersion < 1) {
    await migrateToVersion1(db);
  }

  if (currentVersion < 2) {
    await migrateToVersion2(db);
  }

  if (currentVersion < 3) {
    await migrateToVersion3(db);
  }

  if (currentVersion < 4) {
    await migrateToVersion4(db);
  }

  if (currentVersion < 5) {
    await migrateToVersion5(db);
  }

  if (currentVersion < 6) {
    await migrateToVersion6(db);
  }

  if (currentVersion < 7) {
    await migrateToVersion7(db);
  }

  if (currentVersion < 8) {
    await migrateToVersion8(db);
  }

  await db.execAsync(
    `PRAGMA user_version = ${DATABASE_VERSION};`
  );
}

async function migrateToVersion1(
  db: Awaited<
    ReturnType<typeof getDatabase>
  >
): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

async function migrateToVersion2(
  db: Awaited<
    ReturnType<typeof getDatabase>
  >
): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS households (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      purchase_date TEXT,
      expiration_date TEXT,
      location TEXT NOT NULL CHECK (location IN ('pantry', 'refrigerator')),
      status TEXT NOT NULL CHECK (status IN ('available', 'low_stock', 'out_of_stock', 'expired')),
      registered_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shopping_lists (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shopping_items (
      id TEXT PRIMARY KEY NOT NULL,
      shopping_list_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT,
      purchased INTEGER NOT NULL DEFAULT 0 CHECK (purchased IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS financial_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'debit_card', 'credit_card', 'bank_transfer', 'other')),
      date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      saved_amount REAL NOT NULL,
      target_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS planning_items (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL CHECK (
        type IN ('meal', 'recipe', 'activity', 'task', 'reminder')
      ),
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        sync_status IN ('pending', 'synced', 'error')
      ),
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_household
      ON products(household_id);
    CREATE INDEX IF NOT EXISTS idx_products_expiration
      ON products(expiration_date);
    CREATE INDEX IF NOT EXISTS idx_shopping_lists_household
      ON shopping_lists(household_id);
    CREATE INDEX IF NOT EXISTS idx_shopping_items_list
      ON shopping_items(shopping_list_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_household
      ON financial_transactions(household_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON financial_transactions(date);
    CREATE INDEX IF NOT EXISTS idx_savings_goals_household
      ON savings_goals(household_id);
    CREATE INDEX IF NOT EXISTS idx_planning_household
      ON planning_items(household_id);
    CREATE INDEX IF NOT EXISTS idx_planning_date
      ON planning_items(date);
  `);
}

async function migrateToVersion3(
  db: Awaited<
    ReturnType<typeof getDatabase>
  >
): Promise<void> {
  const columns =
    await db.getAllAsync<{
      name: string;
    }>(
      'PRAGMA table_info(products)'
    );

  const hasSyncStatus = columns.some(
    (column) =>
      column.name === 'sync_status'
  );

  if (!hasSyncStatus) {
    await db.execAsync(`
      ALTER TABLE products
      ADD COLUMN sync_status TEXT
      NOT NULL DEFAULT 'pending';
    `);
  }
}

async function migrateToVersion4(
  db: Awaited<
    ReturnType<typeof getDatabase>
  >
): Promise<void> {
  const columns =
    await db.getAllAsync<{
      name: string;
    }>(
      'PRAGMA table_info(households)'
    );

  const hasOwnerId = columns.some(
    (column) =>
      column.name === 'owner_id'
  );

  const hasCreatedAt = columns.some(
    (column) =>
      column.name === 'created_at'
  );

  const hasUpdatedAt = columns.some(
    (column) =>
      column.name === 'updated_at'
  );

  const hasSyncStatus = columns.some(
    (column) =>
      column.name === 'sync_status'
  );

  if (!hasOwnerId) {
    await db.execAsync(`
      ALTER TABLE households
      ADD COLUMN owner_id TEXT;
    `);
  }

  if (!hasCreatedAt) {
    await db.execAsync(`
      ALTER TABLE households
      ADD COLUMN created_at TEXT;
    `);
  }

  if (!hasUpdatedAt) {
    await db.execAsync(`
      ALTER TABLE households
      ADD COLUMN updated_at TEXT;
    `);
  }

  if (!hasSyncStatus) {
    await db.execAsync(`
      ALTER TABLE households
      ADD COLUMN sync_status TEXT
      NOT NULL DEFAULT 'pending';
    `);
  }
}

async function migrateToVersion6(
  db: Awaited<
    ReturnType<typeof getDatabase>
  >
): Promise<void> {
  const itemColumns =
    await db.getAllAsync<{
      name: string;
    }>(
      'PRAGMA table_info(shopping_items)'
    );

  const itemColumnNames = new Set(
    itemColumns.map(
      (column) => column.name
    )
  );

  if (
    !itemColumnNames.has('id')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN id TEXT;
    `);
  }

  if (
    !itemColumnNames.has('shopping_list_id')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN shopping_list_id TEXT;
    `);
  }

  if (
    !itemColumnNames.has('name')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN name TEXT;
    `);
  }

  if (
    !itemColumnNames.has('quantity')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN quantity REAL
      NOT NULL DEFAULT 1;
    `);
  }

  if (
    !itemColumnNames.has('unit')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN unit TEXT;
    `);
  }

  if (
    !itemColumnNames.has('status')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN status TEXT
      NOT NULL DEFAULT 'pending';
    `);
  }

  if (
    !itemColumnNames.has('created_at')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN created_at TEXT;
    `);
  }

  if (
    !itemColumnNames.has('updated_at')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN updated_at TEXT;
    `);
  }

  if (
    !itemColumnNames.has('sync_status')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN sync_status TEXT
      NOT NULL DEFAULT 'pending';
    `);
  }
}

async function migrateToVersion5(
  db: Awaited<
    ReturnType<typeof getDatabase>
  >
): Promise<void> {
  const columns =
    await db.getAllAsync<{
      name: string;
    }>(
      'PRAGMA table_info(shopping_items)'
    );

  const hasShoppingItemColumn = (
    columnName: string
  ): boolean =>
    columns.some(
      (column) =>
        column.name === columnName
    );

  if (
    !hasShoppingItemColumn('quantity')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN quantity REAL
      NOT NULL DEFAULT 1;
    `);
  }

  if (
    !hasShoppingItemColumn('unit')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN unit TEXT;
    `);
  }

  if (
    !hasShoppingItemColumn('status')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN status TEXT
      NOT NULL DEFAULT 'pending';
    `);
  }

  if (
    !hasShoppingItemColumn('created_at')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN created_at TEXT;
    `);
  }

  if (
    !hasShoppingItemColumn('updated_at')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN updated_at TEXT;
    `);
  }

  if (
    !hasShoppingItemColumn('sync_status')
  ) {
    await db.execAsync(`
      ALTER TABLE shopping_items
      ADD COLUMN sync_status TEXT
      NOT NULL DEFAULT 'pending';
    `);
  }
}

async function migrateToVersion7(
  db: Awaited<
    ReturnType<typeof getDatabase>
  >
): Promise<void> {
  await db.execAsync(`
    DROP TABLE IF EXISTS shopping_items;
    DROP TABLE IF EXISTS shopping_lists;

    CREATE TABLE shopping_lists (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
        CHECK (
          status IN (
            'active',
            'completed'
          )
        ),
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
          sync_status IN (
            'pending',
            'synced',
            'error'
          )
        ),
      FOREIGN KEY (
        household_id
      )
      REFERENCES households(id)
      ON DELETE CASCADE
    );

    CREATE TABLE shopping_items (
      id TEXT PRIMARY KEY NOT NULL,
      shopping_list_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
          status IN (
            'pending',
            'purchased'
          )
        ),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
          sync_status IN (
            'pending',
            'synced',
            'error'
          )
        ),
      FOREIGN KEY (
        shopping_list_id
      )
      REFERENCES shopping_lists(id)
      ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_shopping_lists_household
      ON shopping_lists(household_id);
    CREATE INDEX IF NOT EXISTS idx_shopping_items_list
      ON shopping_items(shopping_list_id);
  `);
}

async function migrateToVersion8(
  db: Awaited<
    ReturnType<typeof getDatabase>
  >
): Promise<void> {
  await db.execAsync(`
    DROP TABLE IF EXISTS financial_transactions;

    CREATE TABLE financial_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL
        CHECK (
          type IN (
            'income',
            'expense'
          )
        ),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL
        CHECK (
          payment_method IN (
            'cash',
            'debit_card',
            'credit_card',
            'bank_transfer',
            'other'
          )
        ),
      date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
          sync_status IN (
            'pending',
            'synced',
            'error'
          )
        ),
      FOREIGN KEY (
        household_id
      )
      REFERENCES households(id)
      ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_household
      ON financial_transactions(household_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON financial_transactions(date);
  `);
}

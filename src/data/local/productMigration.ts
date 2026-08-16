import {
  getStoredProducts,
} from './productStorage';

import {
  getDatabase,
} from './database';

const MIGRATION_KEY =
  'products_asyncstorage_migrated';

export async function migrateProductsToSQLite():
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
    return;
  }

  const products =
    await getStoredProducts();

  for (const product of products) {
    await db.runAsync(
      `
        INSERT OR IGNORE INTO products (
          id,
          household_id,
          name,
          category,
          quantity,
          unit,
          purchase_date,
          expiration_date,
          location,
          status,
          registered_by,
          created_at,
          updated_at,
          sync_status
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `,
      product.id,
      product.householdId,
      product.name,
      product.category,
      product.quantity,
      product.unit,
      product.purchaseDate ?? null,
      product.expirationDate ?? null,
      product.location,
      product.status,
      product.registeredBy,
      product.createdAt,
      product.updatedAt,
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
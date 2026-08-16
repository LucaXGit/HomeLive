import { Product } from '../../domain/entities';

import {
  CreateProductData,
  ProductRepository,
  UpdateProductData,
} from '../../domain/repositories/ProductRepository';

import {
  getProductStatus,
} from '../../domain/usecases/productStatus';

import {
  getDatabase,
} from '../local/database';

import {
  debugSyncQueue,
  enqueueSyncOperation,
} from '../local/syncQueue';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

interface ProductRow {
  id: string;
  household_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_date: string | null;
  expiration_date: string | null;
  location: Product['location'];
  status: Product['status'];
  registered_by: string;
  created_at: string;
  updated_at: string;
  sync_status: string;
}

function rowToProduct(
  row: ProductRow
): Product {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    unit: row.unit,
    purchaseDate:
      row.purchase_date ?? undefined,
    expirationDate:
      row.expiration_date ?? undefined,
    location: row.location,
    status: row.status,
    registeredBy: row.registered_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class LocalProductRepository
  implements ProductRepository
{
  async create(
    data: CreateProductData
  ): Promise<Product> {
    const db = await getDatabase();

    const now =
      new Date().toISOString();

    const product: Product = {
      id: generateId(),
      householdId: data.householdId,
      name: data.name.trim(),
      category: data.category.trim(),
      quantity: data.quantity,
      unit: data.unit.trim(),
      purchaseDate:
        data.purchaseDate,
      expirationDate:
        data.expirationDate,
      location: data.location,
      status: getProductStatus(
        data.quantity,
        data.expirationDate
      ),
      registeredBy:
        data.registeredBy,
      createdAt: now,
      updatedAt: now,
    };

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
          INSERT INTO products (
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

      await enqueueSyncOperation(
        'product',
        product.id,
        'create',
        product
      );
      await debugSyncQueue();
    });

    return product;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<Product[]> {
    const db = await getDatabase();

    const rows =
      await db.getAllAsync<ProductRow>(
        `
          SELECT *
          FROM products
          WHERE household_id = ?
          ORDER BY created_at ASC
        `,
        householdId
      );

    const products =
      rows.map(rowToProduct);

    let hasStatusChanges = false;

    for (const product of products) {
      const currentStatus =
        getProductStatus(
          product.quantity,
          product.expirationDate
        );

      if (
        currentStatus !==
        product.status
      ) {
        hasStatusChanges = true;

        product.status =
          currentStatus;

        product.updatedAt =
          new Date().toISOString();

        await db.runAsync(
          `
            UPDATE products
            SET
              status = ?,
              updated_at = ?,
              sync_status = 'pending'
            WHERE id = ?
          `,
          product.status,
          product.updatedAt,
          product.id
        );
      }
    }

    if (hasStatusChanges) {
      return products;
    }

    return products;
  }

  async findById(
    id: string
  ): Promise<Product | null> {
    const db = await getDatabase();

    const row =
      await db.getFirstAsync<ProductRow>(
        `
          SELECT *
          FROM products
          WHERE id = ?
        `,
        id
      );

    return row
      ? rowToProduct(row)
      : null;
  }

  async update(
    id: string,
    data: UpdateProductData
  ): Promise<Product> {
    const current =
      await this.findById(id);

    if (!current) {
      throw new Error(
        'Producto no encontrado.'
      );
    }

    const updatedProduct: Product = {
      ...current,
      ...data,
      name:
        data.name !== undefined
          ? data.name.trim()
          : current.name,
      category:
        data.category !== undefined
          ? data.category.trim()
          : current.category,
      unit:
        data.unit !== undefined
          ? data.unit.trim()
          : current.unit,
      updatedAt:
        new Date().toISOString(),
    };

    updatedProduct.status =
      getProductStatus(
        updatedProduct.quantity,
        updatedProduct.expirationDate
      );

    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
          UPDATE products
          SET
            name = ?,
            category = ?,
            quantity = ?,
            unit = ?,
            purchase_date = ?,
            expiration_date = ?,
            location = ?,
            status = ?,
            updated_at = ?,
            sync_status = 'pending'
          WHERE id = ?
        `,
        updatedProduct.name,
        updatedProduct.category,
        updatedProduct.quantity,
        updatedProduct.unit,
        updatedProduct.purchaseDate ?? null,
        updatedProduct.expirationDate ?? null,
        updatedProduct.location,
        updatedProduct.status,
        updatedProduct.updatedAt,
        updatedProduct.id
      );

      await enqueueSyncOperation(
        'product',
        updatedProduct.id,
        'update',
        updatedProduct
      );
      await debugSyncQueue();
    });

    return updatedProduct;
  }

  async delete(
    id: string
  ): Promise<void> {
    const product =
      await this.findById(id);

    if (!product) {
      throw new Error(
        'Producto no encontrado.'
      );
    }

    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      const result =
        await db.runAsync(
          `
            DELETE FROM products
            WHERE id = ?
          `,
          id
        );

      if (result.changes === 0) {
        throw new Error(
          'Producto no encontrado.'
        );
      }

      await enqueueSyncOperation(
        'product',
        id,
        'delete',
        {
          id,
          householdId:
            product.householdId,
        }
      );
      await debugSyncQueue();
    });
  }
}
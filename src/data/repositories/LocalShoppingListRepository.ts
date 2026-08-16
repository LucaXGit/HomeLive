import {
  ShoppingItem,
  ShoppingList,
} from '../../domain/entities';

import {
  AddShoppingItemData,
  CreateShoppingListData,
  ShoppingListRepository,
} from '../../domain/repositories/ShoppingListRepository';

import {
  getDatabase,
} from '../local/database';

import {
  enqueueSyncOperation,
} from '../local/syncQueue';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

interface ShoppingListRow {
  id: string;
  household_id: string;
  name: string;
  date: string;
  status: ShoppingList['status'];
  created_by: string;
  created_at: string;
  updated_at: string;
  sync_status: string;
}

interface ShoppingItemRow {
  id: string;
  shopping_list_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  status: ShoppingItem['status'];
  created_at: string;
  updated_at: string;
  sync_status: string;
}

function rowToShoppingItem(
  row: ShoppingItemRow
): ShoppingItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit ?? undefined,
    status: row.status,
  };
}

function calculateListStatus(
  items: ShoppingItem[]
): ShoppingList['status'] {
  if (
    items.length > 0 &&
    items.every(
      (item) =>
        item.status === 'purchased'
    )
  ) {
    return 'completed';
  }

  return 'active';
}

export class LocalShoppingListRepository
  implements ShoppingListRepository
{
  private async getItemsByListId(
    listId: string
  ): Promise<ShoppingItem[]> {
    const db = await getDatabase();

    const rows =
      await db.getAllAsync<ShoppingItemRow>(
        `
          SELECT *
          FROM shopping_items
          WHERE shopping_list_id = ?
          ORDER BY created_at ASC
        `,
        listId
      );

    return rows.map(rowToShoppingItem);
  }

  private async rowToShoppingList(
    row: ShoppingListRow
  ): Promise<ShoppingList> {
    const items =
      await this.getItemsByListId(
        row.id
      );

    return {
      id: row.id,
      householdId:
        row.household_id,
      name: row.name,
      date: row.date,
      status: row.status,
      items,
      createdBy:
        row.created_by,
      createdAt:
        row.created_at,
      updatedAt:
        row.updated_at,
    };
  }

  async createList(
    data: CreateShoppingListData
  ): Promise<ShoppingList> {
    const db = await getDatabase();

    const now =
      new Date().toISOString();

    const list: ShoppingList = {
      id: generateId(),
      householdId:
        data.householdId,
      name: data.name.trim(),
      date: data.date,
      status: 'active',
      items: [],
      createdBy:
        data.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
          INSERT INTO shopping_lists (
            id,
            household_id,
            name,
            date,
            status,
            created_by,
            created_at,
            updated_at,
            sync_status
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `,
        list.id,
        list.householdId,
        list.name,
        list.date,
        list.status,
        list.createdBy,
        list.createdAt,
        list.updatedAt,
        'pending'
      );

      await enqueueSyncOperation(
        'shopping_list',
        list.id,
        'create',
        list
      );
    });

    return list;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<ShoppingList[]> {
    const db = await getDatabase();

    const rows =
      await db.getAllAsync<ShoppingListRow>(
        `
          SELECT *
          FROM shopping_lists
          WHERE household_id = ?
          ORDER BY date DESC,
                   created_at DESC
        `,
        householdId
      );

    return Promise.all(
      rows.map((row) =>
        this.rowToShoppingList(row)
      )
    );
  }

  async findById(
    id: string
  ): Promise<ShoppingList | null> {
    const db = await getDatabase();

    const row =
      await db.getFirstAsync<ShoppingListRow>(
        `
          SELECT *
          FROM shopping_lists
          WHERE id = ?
        `,
        id
      );

    if (!row) {
      return null;
    }

    return this.rowToShoppingList(
      row
    );
  }

  async addItem(
    listId: string,
    data: AddShoppingItemData
  ): Promise<ShoppingList> {
    const db = await getDatabase();

    const list =
      await this.findById(listId);

    if (!list) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    const now =
      new Date().toISOString();

    const item: ShoppingItem = {
      id: generateId(),
      name: data.name.trim(),
      quantity: data.quantity,
      unit:
        data.unit?.trim() ||
        undefined,
      status: 'pending',
    };

    await db.withTransactionAsync(
      async () => {
        await db.runAsync(
          `
            INSERT INTO shopping_items (
              id,
              shopping_list_id,
              name,
              quantity,
              unit,
              status,
              created_at,
              updated_at,
              sync_status
            )
            VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
          `,
          item.id,
          listId,
          item.name,
          item.quantity,
          item.unit ?? null,
          item.status,
          now,
          now,
          'pending'
        );

        await enqueueSyncOperation(
          'shopping_item',
          item.id,
          'create',
          {
            ...item,
            shoppingListId: listId,
          }
        );

        await db.runAsync(
          `
            UPDATE shopping_lists
            SET
              status = 'active',
              updated_at = ?,
              sync_status = 'pending'
            WHERE id = ?
          `,
          now,
          listId
        );

        await enqueueSyncOperation(
          'shopping_list',
          listId,
          'update',
          {
            id: listId,
            status: 'active',
            updatedAt: now,
          }
        );
      }
    );

    const updatedList =
      await this.findById(listId);

    if (!updatedList) {
      throw new Error(
        'No fue posible recuperar la lista actualizada.'
      );
    }

    return updatedList;
  }

  async toggleItemPurchased(
    listId: string,
    itemId: string
  ): Promise<ShoppingList> {
    const db = await getDatabase();

    const itemRow =
      await db.getFirstAsync<ShoppingItemRow>(
        `
          SELECT *
          FROM shopping_items
          WHERE id = ?
            AND shopping_list_id = ?
        `,
        itemId,
        listId
      );

    if (!itemRow) {
      throw new Error(
        'Producto de la lista no encontrado.'
      );
    }

    const newStatus:
      ShoppingItem['status'] =
      itemRow.status === 'pending'
        ? 'purchased'
        : 'pending';

    const now =
      new Date().toISOString();

    await db.withTransactionAsync(
      async () => {
        await db.runAsync(
          `
            UPDATE shopping_items
            SET
              status = ?,
              updated_at = ?,
              sync_status = 'pending'
            WHERE id = ?
          `,
          newStatus,
          now,
          itemId
        );

        await enqueueSyncOperation(
          'shopping_item',
          itemId,
          'update',
          {
            id: itemId,
            shoppingListId: listId,
            status: newStatus,
            updatedAt: now,
          }
        );

        const rows =
          await db.getAllAsync<ShoppingItemRow>(
            `
              SELECT *
              FROM shopping_items
              WHERE shopping_list_id = ?
            `,
            listId
          );

        const items =
          rows.map(
            rowToShoppingItem
          );

        const listStatus =
          calculateListStatus(
            items
          );

        await db.runAsync(
          `
            UPDATE shopping_lists
            SET
              status = ?,
              updated_at = ?,
              sync_status = 'pending'
            WHERE id = ?
          `,
          listStatus,
          now,
          listId
        );

        await enqueueSyncOperation(
          'shopping_list',
          listId,
          'update',
          {
            id: listId,
            status: listStatus,
            updatedAt: now,
          }
        );
      }
    );

    const updatedList =
      await this.findById(listId);

    if (!updatedList) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    return updatedList;
  }

  async removeItem(
    listId: string,
    itemId: string
  ): Promise<ShoppingList> {
    const db = await getDatabase();

    const item =
      await db.getFirstAsync<ShoppingItemRow>(
        `
          SELECT *
          FROM shopping_items
          WHERE id = ?
            AND shopping_list_id = ?
        `,
        itemId,
        listId
      );

    if (!item) {
      throw new Error(
        'Producto de la lista no encontrado.'
      );
    }

    const now =
      new Date().toISOString();

    await db.withTransactionAsync(
      async () => {
        const result =
          await db.runAsync(
            `
              DELETE FROM shopping_items
              WHERE id = ?
                AND shopping_list_id = ?
            `,
            itemId,
            listId
          );

        if (
          result.changes === 0
        ) {
          throw new Error(
            'Producto de la lista no encontrado.'
          );
        }

        await enqueueSyncOperation(
          'shopping_item',
          itemId,
          'delete',
          {
            id: itemId,
            shoppingListId: listId,
          }
        );

        const rows =
          await db.getAllAsync<ShoppingItemRow>(
            `
              SELECT *
              FROM shopping_items
              WHERE shopping_list_id = ?
            `,
            listId
          );

        const items =
          rows.map(
            rowToShoppingItem
          );

        const listStatus =
          calculateListStatus(
            items
          );

        await db.runAsync(
          `
            UPDATE shopping_lists
            SET
              status = ?,
              updated_at = ?,
              sync_status = 'pending'
            WHERE id = ?
          `,
          listStatus,
          now,
          listId
        );

        await enqueueSyncOperation(
          'shopping_list',
          listId,
          'update',
          {
            id: listId,
            status: listStatus,
            updatedAt: now,
          }
        );
      }
    );

    const updatedList =
      await this.findById(listId);

    if (!updatedList) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    return updatedList;
  }

  async deleteList(
    id: string
  ): Promise<void> {
    const list = await this.findById(id);

    if (!list) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      const result =
        await db.runAsync(
          `
            DELETE FROM shopping_lists
            WHERE id = ?
          `,
          id
        );

      if (result.changes === 0) {
        throw new Error(
          'Lista de compras no encontrada.'
        );
      }

      await enqueueSyncOperation(
        'shopping_list',
        id,
        'delete',
        {
          id,
          householdId: list.householdId,
        }
      );
    });
  }

  async updateStatus(
    id: string,
    status: ShoppingList['status']
  ): Promise<ShoppingList> {
    const db = await getDatabase();

    const now =
      new Date().toISOString();

    await db.withTransactionAsync(async () => {
      const result =
        await db.runAsync(
          `
            UPDATE shopping_lists
            SET
              status = ?,
              updated_at = ?,
              sync_status = 'pending'
            WHERE id = ?
          `,
          status,
          now,
          id
        );

      if (result.changes === 0) {
        throw new Error(
          'Lista de compras no encontrada.'
        );
      }

      await enqueueSyncOperation(
        'shopping_list',
        id,
        'update',
        {
          id,
          status,
          updatedAt: now,
        }
      );
    });

    const updatedList =
      await this.findById(id);

    if (!updatedList) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    return updatedList;
  }
}
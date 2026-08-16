import {
  ShoppingItem,
  ShoppingList,
  ShoppingListStatus,
} from '../../domain/entities';

import {
  AddShoppingItemData,
  CreateShoppingListData,
  ShoppingListRepository,
} from '../../domain/repositories/ShoppingListRepository';

import {
  getStoredShoppingLists,
  saveStoredShoppingLists,
} from '../local/shoppingListStorage';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function calculateListStatus(
  items: ShoppingItem[]
): ShoppingListStatus {
  if (
    items.length > 0 &&
    items.every(
      (item) => item.status === 'purchased'
    )
  ) {
    return 'completed';
  }

  return 'active';
}

export class LocalShoppingListRepository
  implements ShoppingListRepository
{
  async createList(
    data: CreateShoppingListData
  ): Promise<ShoppingList> {
    const lists = await getStoredShoppingLists();

    const now = new Date().toISOString();

    const list: ShoppingList = {
      id: generateId(),
      householdId: data.householdId,
      name: data.name.trim(),
      date: data.date,
      status: 'active',
      items: [],
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await saveStoredShoppingLists([
      ...lists,
      list,
    ]);

    return list;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<ShoppingList[]> {
    const lists = await getStoredShoppingLists();

    return lists.filter(
      (list) =>
        list.householdId === householdId
    );
  }

  async findById(
    id: string
  ): Promise<ShoppingList | null> {
    const lists = await getStoredShoppingLists();

    return (
      lists.find(
        (list) => list.id === id
      ) ?? null
    );
  }

  async addItem(
    listId: string,
    data: AddShoppingItemData
  ): Promise<ShoppingList> {
    const lists = await getStoredShoppingLists();

    const index = lists.findIndex(
      (list) => list.id === listId
    );

    if (index === -1) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    const item: ShoppingItem = {
      id: generateId(),
      name: data.name.trim(),
      quantity: data.quantity,
      unit: data.unit?.trim(),
      status: 'pending',
    };

    const updatedItems = [
      ...lists[index].items,
      item,
    ];

    const updatedList: ShoppingList = {
      ...lists[index],
      items: updatedItems,
      status:
        calculateListStatus(updatedItems),
      updatedAt: new Date().toISOString(),
    };

    lists[index] = updatedList;

    await saveStoredShoppingLists(lists);

    return updatedList;
  }

  async toggleItemPurchased(
    listId: string,
    itemId: string
  ): Promise<ShoppingList> {
    const lists = await getStoredShoppingLists();

    const index = lists.findIndex(
      (list) => list.id === listId
    );

    if (index === -1) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    const itemExists =
      lists[index].items.some(
        (item) => item.id === itemId
      );

    if (!itemExists) {
      throw new Error(
        'Artículo no encontrado.'
      );
    }

    const updatedItems: ShoppingItem[] =
      lists[index].items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          status:
            item.status === 'pending'
              ? 'purchased'
              : 'pending',
        };
      });

    const updatedList: ShoppingList = {
      ...lists[index],
      items: updatedItems,
      status:
        calculateListStatus(updatedItems),
      updatedAt: new Date().toISOString(),
    };

    lists[index] = updatedList;

    await saveStoredShoppingLists(lists);

    return updatedList;
  }

  async removeItem(
    listId: string,
    itemId: string
  ): Promise<ShoppingList> {
    const lists = await getStoredShoppingLists();

    const index = lists.findIndex(
      (list) => list.id === listId
    );

    if (index === -1) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    const currentItems =
      lists[index].items;

    const updatedItems =
      currentItems.filter(
        (item) => item.id !== itemId
      );

    if (
      updatedItems.length ===
      currentItems.length
    ) {
      throw new Error(
        'Artículo no encontrado.'
      );
    }

    const updatedList: ShoppingList = {
      ...lists[index],
      items: updatedItems,
      status:
        calculateListStatus(updatedItems),
      updatedAt: new Date().toISOString(),
    };

    lists[index] = updatedList;

    await saveStoredShoppingLists(lists);

    return updatedList;
  }

  async deleteList(
    listId: string
  ): Promise<void> {
    const lists = await getStoredShoppingLists();

    const filteredLists =
      lists.filter(
        (list) => list.id !== listId
      );

    if (
      filteredLists.length ===
      lists.length
    ) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    await saveStoredShoppingLists(
      filteredLists
    );
  }

  async updateStatus(
    listId: string,
    status: ShoppingListStatus
  ): Promise<ShoppingList> {
    const lists = await getStoredShoppingLists();

    const index = lists.findIndex(
      (list) => list.id === listId
    );

    if (index === -1) {
      throw new Error(
        'Lista de compras no encontrada.'
      );
    }

    const updatedList: ShoppingList = {
      ...lists[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    lists[index] = updatedList;

    await saveStoredShoppingLists(lists);

    return updatedList;
  }
}
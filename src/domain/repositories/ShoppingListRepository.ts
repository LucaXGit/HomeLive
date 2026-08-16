import {
  ShoppingItem,
  ShoppingList,
  ShoppingListStatus,
} from '../entities';

export interface CreateShoppingListData {
  householdId: string;
  name: string;
  date: string;
  createdBy: string;
}

export interface AddShoppingItemData {
  name: string;
  quantity: number;
  unit?: string;
}

export interface ShoppingListRepository {
  createList(
    data: CreateShoppingListData
  ): Promise<ShoppingList>;

  findAllByHousehold(
    householdId: string
  ): Promise<ShoppingList[]>;

  findById(
    id: string
  ): Promise<ShoppingList | null>;

  addItem(
    listId: string,
    data: AddShoppingItemData
  ): Promise<ShoppingList>;

  toggleItemPurchased(
    listId: string,
    itemId: string
  ): Promise<ShoppingList>;

  removeItem(
    listId: string,
    itemId: string
  ): Promise<ShoppingList>;

  deleteList(
    listId: string
  ): Promise<void>;

  updateStatus(
    listId: string,
    status: ShoppingListStatus
  ): Promise<ShoppingList>;
}
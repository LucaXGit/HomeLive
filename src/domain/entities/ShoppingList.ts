export type ShoppingItemStatus = 'pending' | 'purchased';

export type ShoppingListStatus = 'active' | 'completed';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  status: ShoppingItemStatus;
}

export interface ShoppingList {
  id: string;
  householdId: string;
  name: string;
  date: string;
  status: ShoppingListStatus;
  items: ShoppingItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
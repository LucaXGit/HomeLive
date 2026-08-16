import AsyncStorage from '@react-native-async-storage/async-storage';

import { ShoppingList } from '../../domain/entities';

const SHOPPING_LISTS_KEY = '@homelive:shopping_lists';

export async function getStoredShoppingLists():
  Promise<ShoppingList[]> {
  const stored = await AsyncStorage.getItem(
    SHOPPING_LISTS_KEY
  );

  if (!stored) {
    return [];
  }

  return JSON.parse(stored) as ShoppingList[];
}

export async function saveStoredShoppingLists(
  lists: ShoppingList[]
): Promise<void> {
  await AsyncStorage.setItem(
    SHOPPING_LISTS_KEY,
    JSON.stringify(lists)
  );
}
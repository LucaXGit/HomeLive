import AsyncStorage from '@react-native-async-storage/async-storage';

import { Product } from '../../domain/entities';

const PRODUCTS_KEY = '@homelive:products';

export async function getStoredProducts(): Promise<Product[]> {
  const stored = await AsyncStorage.getItem(PRODUCTS_KEY);

  if (!stored) {
    return [];
  }

  return JSON.parse(stored) as Product[];
}

export async function saveStoredProducts(
  products: Product[]
): Promise<void> {
  await AsyncStorage.setItem(
    PRODUCTS_KEY,
    JSON.stringify(products)
  );
}
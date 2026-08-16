import AsyncStorage from '@react-native-async-storage/async-storage';

import { PlanningItem } from '../../domain/entities';

const PLANNING_ITEMS_KEY =
  '@homelive:planning_items';

export async function getStoredPlanningItems():
  Promise<PlanningItem[]> {
  const stored = await AsyncStorage.getItem(
    PLANNING_ITEMS_KEY
  );

  if (!stored) {
    return [];
  }

  return JSON.parse(stored) as PlanningItem[];
}

export async function saveStoredPlanningItems(
  items: PlanningItem[]
): Promise<void> {
  await AsyncStorage.setItem(
    PLANNING_ITEMS_KEY,
    JSON.stringify(items)
  );
}
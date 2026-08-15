import AsyncStorage from '@react-native-async-storage/async-storage';

import { Household } from '../../domain/entities';

const HOUSEHOLDS_KEY = '@homelive:households';

export async function getStoredHouseholds(): Promise<Household[]> {
  const stored = await AsyncStorage.getItem(HOUSEHOLDS_KEY);

  if (!stored) {
    return [];
  }

  return JSON.parse(stored) as Household[];
}

export async function saveStoredHouseholds(
  households: Household[]
): Promise<void> {
  await AsyncStorage.setItem(
    HOUSEHOLDS_KEY,
    JSON.stringify(households)
  );
}
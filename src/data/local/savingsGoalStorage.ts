import AsyncStorage from '@react-native-async-storage/async-storage';

import { SavingsGoal } from '../../domain/entities';

const SAVINGS_GOALS_KEY =
  '@homelive:savings_goals';

export async function getStoredSavingsGoals():
  Promise<SavingsGoal[]> {
  const stored = await AsyncStorage.getItem(
    SAVINGS_GOALS_KEY
  );

  if (!stored) {
    return [];
  }

  return JSON.parse(stored) as SavingsGoal[];
}

export async function saveStoredSavingsGoals(
  goals: SavingsGoal[]
): Promise<void> {
  await AsyncStorage.setItem(
    SAVINGS_GOALS_KEY,
    JSON.stringify(goals)
  );
}
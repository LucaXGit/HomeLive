import { SavingsGoal } from '../../domain/entities';

import {
  CreateSavingsGoalData,
  SavingsGoalRepository,
  UpdateSavingsGoalData,
} from '../../domain/repositories/SavingsGoalRepository';

import {
  getStoredSavingsGoals,
  saveStoredSavingsGoals,
} from '../local/savingsGoalStorage';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function calculateStatus(
  savedAmount: number,
  targetAmount: number
): 'active' | 'completed' {
  return savedAmount >= targetAmount
    ? 'completed'
    : 'active';
}

export class LocalSavingsGoalRepository
  implements SavingsGoalRepository
{
  async create(
    data: CreateSavingsGoalData
  ): Promise<SavingsGoal> {
    const goals =
      await getStoredSavingsGoals();

    const now = new Date().toISOString();

    const goal: SavingsGoal = {
      id: generateId(),
      householdId: data.householdId,
      name: data.name.trim(),
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount,
      targetDate: data.targetDate,
      status: calculateStatus(
        data.savedAmount,
        data.targetAmount
      ),
      createdAt: now,
      updatedAt: now,
    };

    await saveStoredSavingsGoals([
      ...goals,
      goal,
    ]);

    return goal;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<SavingsGoal[]> {
    const goals =
      await getStoredSavingsGoals();

    return goals.filter(
      (goal) =>
        goal.householdId === householdId
    );
  }

  async findById(
    id: string
  ): Promise<SavingsGoal | null> {
    const goals =
      await getStoredSavingsGoals();

    return (
      goals.find(
        (goal) => goal.id === id
      ) ?? null
    );
  }

  async update(
    id: string,
    data: UpdateSavingsGoalData
  ): Promise<SavingsGoal> {
    const goals =
      await getStoredSavingsGoals();

    const index = goals.findIndex(
      (goal) => goal.id === id
    );

    if (index === -1) {
      throw new Error(
        'Meta de ahorro no encontrada.'
      );
    }

    const currentGoal = goals[index];

    const updatedGoal: SavingsGoal = {
      ...currentGoal,
      ...data,
      name:
        data.name !== undefined
          ? data.name.trim()
          : currentGoal.name,
      status:
        data.status === 'cancelled'
          ? 'cancelled'
          : calculateStatus(
              data.savedAmount ??
                currentGoal.savedAmount,
              data.targetAmount ??
                currentGoal.targetAmount
            ),
      updatedAt: new Date().toISOString(),
    };

    goals[index] = updatedGoal;

    await saveStoredSavingsGoals(goals);

    return updatedGoal;
  }

  async delete(
    id: string
  ): Promise<void> {
    const goals =
      await getStoredSavingsGoals();

    const filteredGoals =
      goals.filter(
        (goal) => goal.id !== id
      );

    if (
      filteredGoals.length === goals.length
    ) {
      throw new Error(
        'Meta de ahorro no encontrada.'
      );
    }

    await saveStoredSavingsGoals(
      filteredGoals
    );
  }
}
import {
  SavingsGoal,
  SavingsGoalStatus,
} from '../entities';

export interface CreateSavingsGoalData {
  householdId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
}

export interface UpdateSavingsGoalData {
  name?: string;
  targetAmount?: number;
  savedAmount?: number;
  targetDate?: string;
  status?: SavingsGoalStatus;
}

export interface SavingsGoalRepository {
  create(
    data: CreateSavingsGoalData
  ): Promise<SavingsGoal>;

  findAllByHousehold(
    householdId: string
  ): Promise<SavingsGoal[]>;

  findById(
    id: string
  ): Promise<SavingsGoal | null>;

  update(
    id: string,
    data: UpdateSavingsGoalData
  ): Promise<SavingsGoal>;

  delete(
    id: string
  ): Promise<void>;
}
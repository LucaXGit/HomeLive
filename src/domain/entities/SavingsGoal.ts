export type SavingsGoalStatus =
  | 'active'
  | 'completed'
  | 'cancelled';

export interface SavingsGoal {
  id: string;
  householdId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  status: SavingsGoalStatus;
  createdAt: string;
  updatedAt: string;
}
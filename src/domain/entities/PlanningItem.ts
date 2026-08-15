export type PlanningItemType =
  | 'meal'
  | 'recipe'
  | 'activity'
  | 'task'
  | 'reminder';

export interface PlanningItem {
  id: string;
  householdId: string;
  userId: string;
  title: string;
  description?: string;
  type: PlanningItemType;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
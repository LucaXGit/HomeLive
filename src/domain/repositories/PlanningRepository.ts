import {
  PlanningItem,
  PlanningItemType,
} from '../entities';

export interface CreatePlanningItemData {
  householdId: string;
  userId: string;
  title: string;
  description?: string;
  type: PlanningItemType;
  date: string;
  completed: boolean;
}

export interface UpdatePlanningItemData {
  title?: string;
  description?: string;
  type?: PlanningItemType;
  date?: string;
  completed?: boolean;
}

export interface PlanningRepository {
  create(
    data: CreatePlanningItemData
  ): Promise<PlanningItem>;

  findAllByHousehold(
    householdId: string
  ): Promise<PlanningItem[]>;

  findById(
    id: string
  ): Promise<PlanningItem | null>;

  update(
    id: string,
    data: UpdatePlanningItemData
  ): Promise<PlanningItem>;

  delete(
    id: string
  ): Promise<void>;
}
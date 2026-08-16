import { PlanningItem } from '../../domain/entities';

import {
  CreatePlanningItemData,
  PlanningRepository,
  UpdatePlanningItemData,
} from '../../domain/repositories/PlanningRepository';

import {
  getStoredPlanningItems,
  saveStoredPlanningItems,
} from '../local/planningStorage';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export class LocalPlanningRepository
  implements PlanningRepository
{
  async create(
    data: CreatePlanningItemData
  ): Promise<PlanningItem> {
    const items =
      await getStoredPlanningItems();

    const now = new Date().toISOString();

    const item: PlanningItem = {
      id: generateId(),
      householdId: data.householdId,
      userId: data.userId,
      title: data.title.trim(),
      description:
        data.description?.trim(),
      type: data.type,
      date: data.date,
      completed: data.completed,
      createdAt: now,
      updatedAt: now,
    };

    await saveStoredPlanningItems([
      ...items,
      item,
    ]);

    return item;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<PlanningItem[]> {
    const items =
      await getStoredPlanningItems();

    return items.filter(
      (item) =>
        item.householdId === householdId
    );
  }

  async findById(
    id: string
  ): Promise<PlanningItem | null> {
    const items =
      await getStoredPlanningItems();

    return (
      items.find(
        (item) => item.id === id
      ) ?? null
    );
  }

  async update(
    id: string,
    data: UpdatePlanningItemData
  ): Promise<PlanningItem> {
    const items =
      await getStoredPlanningItems();

    const index = items.findIndex(
      (item) => item.id === id
    );

    if (index === -1) {
      throw new Error(
        'Elemento de planificación no encontrado.'
      );
    }

    const updatedItem: PlanningItem = {
      ...items[index],
      ...data,
      title:
        data.title !== undefined
          ? data.title.trim()
          : items[index].title,
      description:
        data.description !== undefined
          ? data.description.trim() || undefined
          : items[index].description,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;

    await saveStoredPlanningItems(items);

    return updatedItem;
  }

  async delete(
    id: string
  ): Promise<void> {
    const items =
      await getStoredPlanningItems();

    const filteredItems =
      items.filter(
        (item) => item.id !== id
      );

    if (
      filteredItems.length ===
      items.length
    ) {
      throw new Error(
        'Elemento de planificación no encontrado.'
      );
    }

    await saveStoredPlanningItems(
      filteredItems
    );
  }
}
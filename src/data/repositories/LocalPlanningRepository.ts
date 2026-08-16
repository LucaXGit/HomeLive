import { PlanningItem } from '../../domain/entities';

import {
  CreatePlanningItemData,
  PlanningRepository,
  UpdatePlanningItemData,
} from '../../domain/repositories/PlanningRepository';

import {
  getDatabase,
} from '../local/database';

import {
  enqueueSyncOperation,
} from '../local/syncQueue';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

interface PlanningItemRow {
  id: string;
  household_id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: PlanningItem['type'];
  date: string;
  completed: number;
  created_at: string;
  updated_at: string;
  sync_status: string;
}

function rowToPlanningItem(
  row: PlanningItemRow
): PlanningItem {
  return {
    id: row.id,
    householdId: row.household_id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    date: row.date,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class LocalPlanningRepository
  implements PlanningRepository
{
  async create(
    data: CreatePlanningItemData
  ): Promise<PlanningItem> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const item: PlanningItem = {
      id: generateId(),
      householdId: data.householdId,
      userId: data.userId,
      title: data.title.trim(),
      description: data.description?.trim(),
      type: data.type,
      date: data.date,
      completed: data.completed,
      createdAt: now,
      updatedAt: now,
    };

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
          INSERT INTO planning_items (
            id,
            household_id,
            user_id,
            title,
            description,
            type,
            date,
            completed,
            created_at,
            updated_at,
            sync_status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        item.id,
        item.householdId,
        item.userId,
        item.title,
        item.description ?? null,
        item.type,
        item.date,
        item.completed ? 1 : 0,
        item.createdAt,
        item.updatedAt,
        'pending'
      );

      await enqueueSyncOperation(
        'planning_item',
        item.id,
        'create',
        item
      );
    });

    return item;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<PlanningItem[]> {
    const db = await getDatabase();

    const rows =
      await db.getAllAsync<PlanningItemRow>(
        `
          SELECT *
          FROM planning_items
          WHERE household_id = ?
          ORDER BY date ASC,
                   created_at ASC
        `,
        householdId
      );

    return rows.map(rowToPlanningItem);
  }

  async findById(
    id: string
  ): Promise<PlanningItem | null> {
    const db = await getDatabase();

    const row =
      await db.getFirstAsync<PlanningItemRow>(
        `
          SELECT *
          FROM planning_items
          WHERE id = ?
        `,
        id
      );

    return row ? rowToPlanningItem(row) : null;
  }

  async update(
    id: string,
    data: UpdatePlanningItemData
  ): Promise<PlanningItem> {
    const current = await this.findById(id);

    if (!current) {
      throw new Error(
        'Elemento de planificación no encontrado.'
      );
    }

    const updatedItem: PlanningItem = {
      ...current,
      ...data,
      title:
        data.title !== undefined
          ? data.title.trim()
          : current.title,
      description:
        data.description !== undefined
          ? data.description.trim() || undefined
          : current.description,
      updatedAt: new Date().toISOString(),
    };

    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `
          UPDATE planning_items
          SET
            title = ?,
            description = ?,
            type = ?,
            date = ?,
            completed = ?,
            updated_at = ?,
            sync_status = 'pending'
          WHERE id = ?
        `,
        updatedItem.title,
        updatedItem.description ?? null,
        updatedItem.type,
        updatedItem.date,
        updatedItem.completed ? 1 : 0,
        updatedItem.updatedAt,
        updatedItem.id
      );

      await enqueueSyncOperation(
        'planning_item',
        updatedItem.id,
        'update',
        updatedItem
      );
    });

    return updatedItem;
  }

  async delete(
    id: string
  ): Promise<void> {
    const item = await this.findById(id);

    if (!item) {
      throw new Error(
        'Elemento de planificación no encontrado.'
      );
    }

    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      const result =
        await db.runAsync(
          `
            DELETE FROM planning_items
            WHERE id = ?
          `,
          id
        );

      if (result.changes === 0) {
        throw new Error(
          'Elemento de planificación no encontrado.'
        );
      }

      await enqueueSyncOperation(
        'planning_item',
        id,
        'delete',
        {
          id,
          householdId: item.householdId,
        }
      );
    });
  }
}
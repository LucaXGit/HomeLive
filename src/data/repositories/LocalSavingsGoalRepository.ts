import { SavingsGoal } from '../../domain/entities';

import {
  CreateSavingsGoalData,
  SavingsGoalRepository,
  UpdateSavingsGoalData,
} from '../../domain/repositories/SavingsGoalRepository';

import {
  getDatabase,
} from '../local/database';

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

interface SavingsGoalRow {
  id: string;
  household_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  status: SavingsGoal['status'];
  created_at: string;
  updated_at: string;
  sync_status: string;
}

function rowToSavingsGoal(
  row: SavingsGoalRow
): SavingsGoal {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    targetAmount: row.target_amount,
    savedAmount: row.saved_amount,
    targetDate: row.target_date ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class LocalSavingsGoalRepository
  implements SavingsGoalRepository
{
  async create(
    data: CreateSavingsGoalData
  ): Promise<SavingsGoal> {
    const db = await getDatabase();

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

    await db.runAsync(
      `
        INSERT INTO savings_goals (
          id,
          household_id,
          name,
          target_amount,
          saved_amount,
          target_date,
          status,
          created_at,
          updated_at,
          sync_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      goal.id,
      goal.householdId,
      goal.name,
      goal.targetAmount,
      goal.savedAmount,
      goal.targetDate ?? null,
      goal.status,
      goal.createdAt,
      goal.updatedAt,
      'pending'
    );

    return goal;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<SavingsGoal[]> {
    const db = await getDatabase();

    const rows =
      await db.getAllAsync<SavingsGoalRow>(
        `
          SELECT *
          FROM savings_goals
          WHERE household_id = ?
          ORDER BY created_at DESC
        `,
        householdId
      );

    return rows.map(rowToSavingsGoal);
  }

  async findById(
    id: string
  ): Promise<SavingsGoal | null> {
    const db = await getDatabase();

    const row =
      await db.getFirstAsync<SavingsGoalRow>(
        `
          SELECT *
          FROM savings_goals
          WHERE id = ?
        `,
        id
      );

    return row ? rowToSavingsGoal(row) : null;
  }

  async update(
    id: string,
    data: UpdateSavingsGoalData
  ): Promise<SavingsGoal> {
    const current =
      await this.findById(id);

    if (!current) {
      throw new Error(
        'Meta de ahorro no encontrada.'
      );
    }

    const updatedGoal: SavingsGoal = {
      ...current,
      ...data,
      name:
        data.name !== undefined
          ? data.name.trim()
          : current.name,
      targetDate:
        data.targetDate !== undefined
          ? data.targetDate
          : current.targetDate,
      updatedAt: new Date().toISOString(),
    };

    if (
      data.status === 'cancelled'
    ) {
      updatedGoal.status = 'cancelled';
    } else {
      updatedGoal.status =
        calculateStatus(
          updatedGoal.savedAmount,
          updatedGoal.targetAmount
        );
    }

    const db = await getDatabase();

    await db.runAsync(
      `
        UPDATE savings_goals
        SET
          name = ?,
          target_amount = ?,
          saved_amount = ?,
          target_date = ?,
          status = ?,
          updated_at = ?,
          sync_status = 'pending'
        WHERE id = ?
      `,
      updatedGoal.name,
      updatedGoal.targetAmount,
      updatedGoal.savedAmount,
      updatedGoal.targetDate ?? null,
      updatedGoal.status,
      updatedGoal.updatedAt,
      updatedGoal.id
    );

    return updatedGoal;
  }

  async delete(
    id: string
  ): Promise<void> {
    const db = await getDatabase();

    const result =
      await db.runAsync(
        `
          DELETE FROM savings_goals
          WHERE id = ?
        `,
        id
      );

    if (result.changes === 0) {
      throw new Error(
        'Meta de ahorro no encontrada.'
      );
    }
  }
}
import { FinancialTransaction } from '../../domain/entities';

import {
  CreateFinancialTransactionData,
  FinancialRepository,
  UpdateFinancialTransactionData,
} from '../../domain/repositories/FinancialRepository';

import {
  getDatabase,
} from '../local/database';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

interface FinancialTransactionRow {
  id: string;
  household_id: string;
  user_id: string;
  type: FinancialTransaction['type'];
  amount: number;
  category: string;
  payment_method: FinancialTransaction['paymentMethod'];
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  sync_status: string;
}

function rowToFinancialTransaction(
  row: FinancialTransactionRow
): FinancialTransaction {
  return {
    id: row.id,
    householdId: row.household_id,
    userId: row.user_id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    paymentMethod: row.payment_method,
    date: row.date,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class LocalFinancialRepository
  implements FinancialRepository
{
  async create(
    data: CreateFinancialTransactionData
  ): Promise<FinancialTransaction> {
    const db = await getDatabase();

    const now =
      new Date().toISOString();

    const transaction: FinancialTransaction = {
      id: generateId(),
      householdId: data.householdId,
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      category: data.category.trim(),
      paymentMethod: data.paymentMethod,
      date: data.date,
      description: data.description?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      `
        INSERT INTO financial_transactions (
          id,
          household_id,
          user_id,
          type,
          amount,
          category,
          payment_method,
          date,
          description,
          created_at,
          updated_at,
          sync_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      transaction.id,
      transaction.householdId,
      transaction.userId,
      transaction.type,
      transaction.amount,
      transaction.category,
      transaction.paymentMethod,
      transaction.date,
      transaction.description ?? null,
      transaction.createdAt,
      transaction.updatedAt,
      'pending'
    );

    return transaction;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<FinancialTransaction[]> {
    const db = await getDatabase();

    const rows =
      await db.getAllAsync<FinancialTransactionRow>(
        `
          SELECT *
          FROM financial_transactions
          WHERE household_id = ?
          ORDER BY date DESC,
                   created_at DESC
        `,
        householdId
      );

    return rows.map(
      rowToFinancialTransaction
    );
  }

  async findById(
    id: string
  ): Promise<FinancialTransaction | null> {
    const db = await getDatabase();

    const row =
      await db.getFirstAsync<FinancialTransactionRow>(
        `
          SELECT *
          FROM financial_transactions
          WHERE id = ?
        `,
        id
      );

    return row
      ? rowToFinancialTransaction(row)
      : null;
  }

  async update(
    id: string,
    data: UpdateFinancialTransactionData
  ): Promise<FinancialTransaction> {
    const current =
      await this.findById(id);

    if (!current) {
      throw new Error(
        'Movimiento financiero no encontrado.'
      );
    }

    const updatedTransaction: FinancialTransaction = {
      ...current,
      ...data,
      category:
        data.category !== undefined
          ? data.category.trim()
          : current.category,
      description:
        data.description !== undefined
          ? data.description.trim() || undefined
          : current.description,
      updatedAt: new Date().toISOString(),
    };

    const db = await getDatabase();

    await db.runAsync(
      `
        UPDATE financial_transactions
        SET
          type = ?,
          amount = ?,
          category = ?,
          payment_method = ?,
          date = ?,
          description = ?,
          updated_at = ?,
          sync_status = 'pending'
        WHERE id = ?
      `,
      updatedTransaction.type,
      updatedTransaction.amount,
      updatedTransaction.category,
      updatedTransaction.paymentMethod,
      updatedTransaction.date,
      updatedTransaction.description ?? null,
      updatedTransaction.updatedAt,
      updatedTransaction.id
    );

    return updatedTransaction;
  }

  async delete(
    id: string
  ): Promise<void> {
    const db = await getDatabase();

    const result =
      await db.runAsync(
        `
          DELETE FROM financial_transactions
          WHERE id = ?
        `,
        id
      );

    if (result.changes === 0) {
      throw new Error(
        'Movimiento financiero no encontrado.'
      );
    }
  }
}
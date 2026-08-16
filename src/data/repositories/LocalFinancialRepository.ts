import { FinancialTransaction } from '../../domain/entities';

import {
  CreateFinancialTransactionData,
  FinancialRepository,
  UpdateFinancialTransactionData,
} from '../../domain/repositories/FinancialRepository';

import {
  getStoredFinancialTransactions,
  saveStoredFinancialTransactions,
} from '../local/financialStorage';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export class LocalFinancialRepository
  implements FinancialRepository
{
  async create(
    data: CreateFinancialTransactionData
  ): Promise<FinancialTransaction> {
    const transactions =
      await getStoredFinancialTransactions();

    const now = new Date().toISOString();

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

    await saveStoredFinancialTransactions([
      ...transactions,
      transaction,
    ]);

    return transaction;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<FinancialTransaction[]> {
    const transactions =
      await getStoredFinancialTransactions();

    return transactions.filter(
      (transaction) =>
        transaction.householdId === householdId
    );
  }

  async findById(
    id: string
  ): Promise<FinancialTransaction | null> {
    const transactions =
      await getStoredFinancialTransactions();

    return (
      transactions.find(
        (transaction) => transaction.id === id
      ) ?? null
    );
  }

  async update(
    id: string,
    data: UpdateFinancialTransactionData
  ): Promise<FinancialTransaction> {
    const transactions =
      await getStoredFinancialTransactions();

    const index = transactions.findIndex(
      (transaction) => transaction.id === id
    );

    if (index === -1) {
      throw new Error(
        'Movimiento financiero no encontrado.'
      );
    }

    const updatedTransaction: FinancialTransaction = {
      ...transactions[index],
      ...data,
      category:
        data.category !== undefined
          ? data.category.trim()
          : transactions[index].category,
      description:
        data.description !== undefined
          ? data.description.trim() || undefined
          : transactions[index].description,
      updatedAt: new Date().toISOString(),
    };

    transactions[index] = updatedTransaction;

    await saveStoredFinancialTransactions(
      transactions
    );

    return updatedTransaction;
  }

  async delete(
    id: string
  ): Promise<void> {
    const transactions =
      await getStoredFinancialTransactions();

    const filtered =
      transactions.filter(
        (transaction) =>
          transaction.id !== id
      );

    if (
      filtered.length ===
      transactions.length
    ) {
      throw new Error(
        'Movimiento financiero no encontrado.'
      );
    }

    await saveStoredFinancialTransactions(
      filtered
    );
  }
}
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { FinancialTransaction } from '../../domain/entities';
import {
  CreateFinancialTransactionData,
} from '../../domain/repositories/FinancialRepository';
import { LocalFinancialRepository } from '../../data/repositories/LocalFinancialRepository';

import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';

interface FinanceContextValue {
  transactions: FinancialTransaction[];
  loading: boolean;
  createTransaction: (
    data: Omit<
      CreateFinancialTransactionData,
      'householdId' | 'userId'
    >
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  reloadTransactions: () => Promise<void>;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

const FinanceContext =
  createContext<FinanceContextValue | undefined>(undefined);

const financialRepository =
  new LocalFinancialRepository();

export function FinanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { household } = useHousehold();

  const [transactions, setTransactions] =
    useState<FinancialTransaction[]>([]);

  const [loading, setLoading] = useState(true);

  const reloadTransactions = async () => {
    if (!household) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const stored =
        await financialRepository.findAllByHousehold(
          household.id
        );

      setTransactions(stored);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadTransactions();
  }, [household]);

  const createTransaction = async (
    data: Omit<
      CreateFinancialTransactionData,
      'householdId' | 'userId'
    >
  ) => {
    if (!user || !household) {
      throw new Error(
        'No existe un usuario o hogar activo.'
      );
    }

    const transaction =
      await financialRepository.create({
        ...data,
        householdId: household.id,
        userId: user.id,
      });

    setTransactions((current) => [
      ...current,
      transaction,
    ]);
  };

  const deleteTransaction = async (
    id: string
  ) => {
    await financialRepository.delete(id);

    setTransactions((current) =>
      current.filter(
        (transaction) =>
          transaction.id !== id
      )
    );
  };

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === 'income'
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        ),
    [transactions]
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === 'expense'
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        ),
    [transactions]
  );

  const balance =
    totalIncome - totalExpenses;

  const value = useMemo(
    () => ({
      transactions,
      loading,
      createTransaction,
      deleteTransaction,
      reloadTransactions,
      totalIncome,
      totalExpenses,
      balance,
    }),
    [
      transactions,
      loading,
      totalIncome,
      totalExpenses,
      balance,
    ]
  );

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error(
      'useFinance debe utilizarse dentro de FinanceProvider.'
    );
  }

  return context;
}
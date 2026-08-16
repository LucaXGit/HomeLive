import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { SavingsGoal } from '../../domain/entities';
import {
  CreateSavingsGoalData,
  UpdateSavingsGoalData,
} from '../../domain/repositories/SavingsGoalRepository';
import { LocalSavingsGoalRepository } from '../../data/repositories/LocalSavingsGoalRepository';

import { useHousehold } from './HouseholdContext';

interface SavingsGoalContextValue {
  goals: SavingsGoal[];
  loading: boolean;
  createGoal: (
    data: Omit<CreateSavingsGoalData, 'householdId'>
  ) => Promise<void>;
  updateGoal: (
    id: string,
    data: UpdateSavingsGoalData
  ) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  reloadGoals: () => Promise<void>;
}

const SavingsGoalContext =
  createContext<SavingsGoalContextValue | undefined>(undefined);

const savingsGoalRepository =
  new LocalSavingsGoalRepository();

export function SavingsGoalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { household } = useHousehold();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadGoals = async () => {
    if (!household) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const storedGoals =
        await savingsGoalRepository.findAllByHousehold(
          household.id
        );

      setGoals(storedGoals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadGoals();
  }, [household]);

  const createGoal = async (
    data: Omit<CreateSavingsGoalData, 'householdId'>
  ) => {
    if (!household) {
      throw new Error(
        'No existe un hogar activo.'
      );
    }

    const goal =
      await savingsGoalRepository.create({
        ...data,
        householdId: household.id,
      });

    setGoals((current) => [
      ...current,
      goal,
    ]);
  };

  const updateGoal = async (
    id: string,
    data: UpdateSavingsGoalData
  ) => {
    const updatedGoal =
      await savingsGoalRepository.update(
        id,
        data
      );

    setGoals((current) =>
      current.map((goal) =>
        goal.id === id
          ? updatedGoal
          : goal
      )
    );
  };

  const deleteGoal = async (
    id: string
  ) => {
    await savingsGoalRepository.delete(id);

    setGoals((current) =>
      current.filter(
        (goal) => goal.id !== id
      )
    );
  };

  const value = useMemo(
    () => ({
      goals,
      loading,
      createGoal,
      updateGoal,
      deleteGoal,
      reloadGoals,
    }),
    [goals, loading]
  );

  return (
    <SavingsGoalContext.Provider value={value}>
      {children}
    </SavingsGoalContext.Provider>
  );
}

export function useSavingsGoals():
  SavingsGoalContextValue {
  const context =
    useContext(SavingsGoalContext);

  if (!context) {
    throw new Error(
      'useSavingsGoals debe utilizarse dentro de SavingsGoalProvider.'
    );
  }

  return context;
}
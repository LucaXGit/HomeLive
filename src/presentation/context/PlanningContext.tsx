import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { PlanningItem } from '../../domain/entities';
import {
  CreatePlanningItemData,
  UpdatePlanningItemData,
} from '../../domain/repositories/PlanningRepository';

import { LocalPlanningRepository } from '../../data/repositories/LocalPlanningRepository';

import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';

interface PlanningContextValue {
  items: PlanningItem[];
  loading: boolean;

  createItem: (
    data: Omit<
      CreatePlanningItemData,
      'householdId' | 'userId'
    >
  ) => Promise<void>;

  updateItem: (
    id: string,
    data: UpdatePlanningItemData
  ) => Promise<void>;

  deleteItem: (id: string) => Promise<void>;

  toggleCompleted: (
    id: string
  ) => Promise<void>;

  reloadItems: () => Promise<void>;
}

const PlanningContext =
  createContext<PlanningContextValue | undefined>(
    undefined
  );

const planningRepository =
  new LocalPlanningRepository();

export function PlanningProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { household } = useHousehold();

  const [items, setItems] =
    useState<PlanningItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const reloadItems = async () => {
    if (!household) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const storedItems =
        await planningRepository.findAllByHousehold(
          household.id
        );

      setItems(storedItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadItems();
  }, [household]);

  const createItem = async (
    data: Omit<
      CreatePlanningItemData,
      'householdId' | 'userId'
    >
  ) => {
    if (!user || !household) {
      throw new Error(
        'No existe un usuario o hogar activo.'
      );
    }

    const item =
      await planningRepository.create({
        ...data,
        householdId: household.id,
        userId: user.id,
      });

    setItems((current) => [
      ...current,
      item,
    ]);
  };

  const updateItem = async (
    id: string,
    data: UpdatePlanningItemData
  ) => {
    const updatedItem =
      await planningRepository.update(
        id,
        data
      );

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? updatedItem
          : item
      )
    );
  };

  const deleteItem = async (
    id: string
  ) => {
    await planningRepository.delete(id);

    setItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  const toggleCompleted = async (
    id: string
  ) => {
    const item = items.find(
      (currentItem) =>
        currentItem.id === id
    );

    if (!item) {
      throw new Error(
        'Elemento de planificación no encontrado.'
      );
    }

    await updateItem(id, {
      completed: !item.completed,
    });
  };

  const value = useMemo(
    () => ({
      items,
      loading,
      createItem,
      updateItem,
      deleteItem,
      toggleCompleted,
      reloadItems,
    }),
    [items, loading]
  );

  return (
    <PlanningContext.Provider
      value={value}
    >
      {children}
    </PlanningContext.Provider>
  );
}

export function usePlanning():
  PlanningContextValue {
  const context =
    useContext(PlanningContext);

  if (!context) {
    throw new Error(
      'usePlanning debe utilizarse dentro de PlanningProvider.'
    );
  }

  return context;
}
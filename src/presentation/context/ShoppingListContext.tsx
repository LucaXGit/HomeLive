import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ShoppingList } from '../../domain/entities';
import { LocalShoppingListRepository } from '../../data/repositories/LocalShoppingListRepository';

import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';

interface ShoppingListContextValue {
  lists: ShoppingList[];
  loading: boolean;
  createList: (
    name: string,
    date: string
  ) => Promise<void>;
  deleteList: (
    listId: string
  ) => Promise<void>;
  addItem: (
    listId: string,
    name: string,
    quantity: number,
    unit?: string
  ) => Promise<void>;
  toggleItemPurchased: (
    listId: string,
    itemId: string
  ) => Promise<void>;
  removeItem: (
    listId: string,
    itemId: string
  ) => Promise<void>;
  reloadLists: () => Promise<void>;
}

const ShoppingListContext =
  createContext<ShoppingListContextValue | undefined>(
    undefined
  );

const shoppingListRepository =
  new LocalShoppingListRepository();

export function ShoppingListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { household } = useHousehold();

  const [lists, setLists] =
    useState<ShoppingList[]>([]);

  const [loading, setLoading] =
    useState(true);

  const reloadLists = async () => {
    if (!household) {
      setLists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const storedLists =
        await shoppingListRepository.findAllByHousehold(
          household.id
        );

      setLists(storedLists);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadLists();
  }, [household]);

  const createList = async (
    name: string,
    date: string
  ) => {
    if (!user || !household) {
      throw new Error(
        'No existe un usuario o hogar activo.'
      );
    }

    if (!name.trim()) {
      throw new Error(
        'El nombre de la lista es obligatorio.'
      );
    }

    if (!date.trim()) {
      throw new Error(
        'La fecha es obligatoria.'
      );
    }

    const newList =
      await shoppingListRepository.createList({
        householdId: household.id,
        name,
        date,
        createdBy: user.id,
      });

    setLists((current) => [
      ...current,
      newList,
    ]);
  };

  const deleteList = async (
    listId: string
  ) => {
    await shoppingListRepository.deleteList(
      listId
    );

    setLists((current) =>
      current.filter(
        (list) => list.id !== listId
      )
    );
  };

  const addItem = async (
    listId: string,
    name: string,
    quantity: number,
    unit?: string
  ) => {
    const updatedList =
      await shoppingListRepository.addItem(
        listId,
        {
          name,
          quantity,
          unit,
        }
      );

    setLists((current) =>
      current.map((list) =>
        list.id === listId ? updatedList : list
      )
    );
  };

  const toggleItemPurchased = async (
    listId: string,
    itemId: string
  ) => {
    const updatedList =
      await shoppingListRepository.toggleItemPurchased(
        listId,
        itemId
      );

    setLists((current) =>
      current.map((list) =>
        list.id === listId ? updatedList : list
      )
    );
  };

  const removeItem = async (
    listId: string,
    itemId: string
  ) => {
    const updatedList =
      await shoppingListRepository.removeItem(
        listId,
        itemId
      );

    setLists((current) =>
      current.map((list) =>
        list.id === listId ? updatedList : list
      )
    );
  };

  const value = useMemo(
    () => ({
      lists,
      loading,
      createList,
      deleteList,
      addItem,
      toggleItemPurchased,
      removeItem,
      reloadLists,
    }),
    [lists, loading]
  );

  return (
    <ShoppingListContext.Provider
      value={value}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingLists():
  ShoppingListContextValue {
  const context =
    useContext(ShoppingListContext);

  if (!context) {
    throw new Error(
      'useShoppingLists debe utilizarse dentro de ShoppingListProvider.'
    );
  }

  return context;
}
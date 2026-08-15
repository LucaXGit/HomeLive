import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Household } from '../../domain/entities';
import { LocalHouseholdRepository } from '../../data/repositories/LocalHouseholdRepository';
import { useAuth } from './AuthContext';

interface HouseholdContextValue {
  household: Household | null;
  loading: boolean;
  createHousehold: (name: string) => Promise<void>;
}

const HouseholdContext =
  createContext<HouseholdContextValue | undefined>(undefined);

const householdRepository = new LocalHouseholdRepository();

export function HouseholdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [household, setHousehold] =
    useState<Household | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHousehold = async () => {
      if (!user) {
        setHousehold(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const storedHousehold =
          await householdRepository.findByUserId(user.id);

        setHousehold(storedHousehold);
      } finally {
        setLoading(false);
      }
    };

    loadHousehold();
  }, [user]);

  const createHousehold = async (name: string) => {
    if (!user) {
      throw new Error(
        'No existe un usuario autenticado.'
      );
    }

    if (!name.trim()) {
      throw new Error(
        'El nombre del hogar es obligatorio.'
      );
    }

    const newHousehold =
      await householdRepository.create({
        name,
        ownerId: user.id,
      });

    setHousehold(newHousehold);
  };

  const value = useMemo(
    () => ({
      household,
      loading,
      createHousehold,
    }),
    [household, loading]
  );

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold(): HouseholdContextValue {
  const context = useContext(HouseholdContext);

  if (!context) {
    throw new Error(
      'useHousehold debe utilizarse dentro de HouseholdProvider.'
    );
  }

  return context;
}
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Product } from '../../domain/entities';
import {
  CreateProductData,
  UpdateProductData,
} from '../../domain/repositories/ProductRepository';
import { LocalProductRepository } from '../../data/repositories/LocalProductRepository';

import { useAuth } from './AuthContext';
import { useHousehold } from './HouseholdContext';

interface PantryContextValue {
  products: Product[];
  loading: boolean;
  createProduct: (
    data: Omit<CreateProductData, 'householdId' | 'registeredBy'>
  ) => Promise<void>;
  updateProduct: (
    id: string,
    data: UpdateProductData
  ) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  reloadProducts: () => Promise<void>;
}

const PantryContext =
  createContext<PantryContextValue | undefined>(undefined);

const productRepository = new LocalProductRepository();

export function PantryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { household } = useHousehold();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadProducts = async () => {
    if (!household) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const storedProducts =
        await productRepository.findAllByHousehold(household.id);

      setProducts(storedProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadProducts();
  }, [household]);

  const createProduct = async (
    data: Omit<CreateProductData, 'householdId' | 'registeredBy'>
  ) => {
    if (!user || !household) {
      throw new Error(
        'No existe un usuario o hogar activo.'
      );
    }

    const product = await productRepository.create({
      ...data,
      householdId: household.id,
      registeredBy: user.id,
    });

    setProducts((current) => [...current, product]);
  };

  const updateProduct = async (
    id: string,
    data: UpdateProductData
  ) => {
    const updatedProduct =
      await productRepository.update(id, data);

    setProducts((current) =>
      current.map((product) =>
        product.id === id ? updatedProduct : product
      )
    );
  };

  const deleteProduct = async (id: string) => {
    await productRepository.delete(id);

    setProducts((current) =>
      current.filter((product) => product.id !== id)
    );
  };

  const value = useMemo(
    () => ({
      products,
      loading,
      createProduct,
      updateProduct,
      deleteProduct,
      reloadProducts,
    }),
    [products, loading]
  );

  return (
    <PantryContext.Provider value={value}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry(): PantryContextValue {
  const context = useContext(PantryContext);

  if (!context) {
    throw new Error(
      'usePantry debe utilizarse dentro de PantryProvider.'
    );
  }

  return context;
}
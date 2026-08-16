import { Product, ProductLocation, ProductStatus } from '../entities';

export interface CreateProductData {
  householdId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expirationDate?: string;
  location: ProductLocation;
  status: ProductStatus;
  registeredBy: string;
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  purchaseDate?: string;
  expirationDate?: string;
  location?: ProductLocation;
  status?: ProductStatus;
}

export interface ProductRepository {
  create(data: CreateProductData): Promise<Product>;
  findAllByHousehold(householdId: string): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  update(id: string, data: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
}
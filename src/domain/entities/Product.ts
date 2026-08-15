export type ProductLocation = 'pantry' | 'refrigerator';

export type ProductStatus =
  | 'available'
  | 'low_stock'
  | 'out_of_stock'
  | 'expired';

export interface Product {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}
import { Product } from '../../domain/entities';
import { getProductStatus } from '../../domain/usecases/productStatus';

import {
  CreateProductData,
  ProductRepository,
  UpdateProductData,
} from '../../domain/repositories/ProductRepository';

import {
  getStoredProducts,
  saveStoredProducts,
} from '../local/productStorage';

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export class LocalProductRepository
  implements ProductRepository
{
  async create(
    data: CreateProductData
  ): Promise<Product> {
    const products = await getStoredProducts();

    const now = new Date().toISOString();

    const product: Product = {
      id: generateId(),
      householdId: data.householdId,
      name: data.name.trim(),
      category: data.category.trim(),
      quantity: data.quantity,
      unit: data.unit.trim(),
      purchaseDate: data.purchaseDate,
      expirationDate: data.expirationDate,
      location: data.location,
      status: getProductStatus(
        data.quantity,
        data.expirationDate
      ),
      registeredBy: data.registeredBy,
      createdAt: now,
      updatedAt: now,
    };

    await saveStoredProducts([
      ...products,
      product,
    ]);

    return product;
  }

  async findAllByHousehold(
    householdId: string
  ): Promise<Product[]> {
    const products = await getStoredProducts();
    let hasChanges = false;

    const updatedProducts = products.map((product) => {
      const currentStatus = getProductStatus(
        product.quantity,
        product.expirationDate
      );

      if (currentStatus === product.status) {
        return product;
      }

      hasChanges = true;

      return {
        ...product,
        status: currentStatus,
        updatedAt: new Date().toISOString(),
      };
    });

    if (hasChanges) {
      await saveStoredProducts(updatedProducts);
    }

    return updatedProducts.filter(
      (product) =>
        product.householdId === householdId
    );
  }

  async findById(
    id: string
  ): Promise<Product | null> {
    const products = await getStoredProducts();

    return (
      products.find(
        (product) => product.id === id
      ) ?? null
    );
  }

  async update(
    id: string,
    data: UpdateProductData
  ): Promise<Product> {
    const products = await getStoredProducts();

    const index = products.findIndex(
      (product) => product.id === id
    );

    if (index === -1) {
      throw new Error(
        'Producto no encontrado.'
      );
    }

    const currentProduct = products[index];
    const mergedProduct = {
      ...currentProduct,
      ...data,
    };

    const updatedProduct: Product = {
      ...mergedProduct,
      status: getProductStatus(
        mergedProduct.quantity,
        mergedProduct.expirationDate
      ),
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;

    await saveStoredProducts(products);

    return updatedProduct;
  }

  async delete(
    id: string
  ): Promise<void> {
    const products = await getStoredProducts();

    const filteredProducts =
      products.filter(
        (product) => product.id !== id
      );

    if (
      filteredProducts.length ===
      products.length
    ) {
      throw new Error(
        'Producto no encontrado.'
      );
    }

    await saveStoredProducts(
      filteredProducts
    );
  }
}
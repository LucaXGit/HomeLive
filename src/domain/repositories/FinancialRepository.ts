import {
  FinancialTransaction,
  PaymentMethod,
  TransactionType,
} from '../entities';

export interface CreateFinancialTransactionData {
  householdId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod: PaymentMethod;
  date: string;
  description?: string;
}

export interface UpdateFinancialTransactionData {
  type?: TransactionType;
  amount?: number;
  category?: string;
  paymentMethod?: PaymentMethod;
  date?: string;
  description?: string;
}

export interface FinancialRepository {
  create(
    data: CreateFinancialTransactionData
  ): Promise<FinancialTransaction>;

  findAllByHousehold(
    householdId: string
  ): Promise<FinancialTransaction[]>;

  findById(
    id: string
  ): Promise<FinancialTransaction | null>;

  update(
    id: string,
    data: UpdateFinancialTransactionData
  ): Promise<FinancialTransaction>;

  delete(
    id: string
  ): Promise<void>;
}
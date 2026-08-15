export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'cash'
  | 'debit_card'
  | 'credit_card'
  | 'bank_transfer'
  | 'other';

export interface FinancialTransaction {
  id: string;
  householdId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod: PaymentMethod;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
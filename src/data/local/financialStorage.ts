import AsyncStorage from '@react-native-async-storage/async-storage';

import { FinancialTransaction } from '../../domain/entities';

const FINANCIAL_TRANSACTIONS_KEY =
  '@homelive:financial_transactions';

export async function getStoredFinancialTransactions():
  Promise<FinancialTransaction[]> {
  const stored = await AsyncStorage.getItem(
    FINANCIAL_TRANSACTIONS_KEY
  );

  if (!stored) {
    return [];
  }

  return JSON.parse(stored) as FinancialTransaction[];
}

export async function saveStoredFinancialTransactions(
  transactions: FinancialTransaction[]
): Promise<void> {
  await AsyncStorage.setItem(
    FINANCIAL_TRANSACTIONS_KEY,
    JSON.stringify(transactions)
  );
}
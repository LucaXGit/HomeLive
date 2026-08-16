export type SyncOperationType =
  | 'create'
  | 'update'
  | 'delete';

export type SyncEntityType =
  | 'user'
  | 'household'
  | 'product'
  | 'shopping_list'
  | 'shopping_item'
  | 'financial_transaction'
  | 'savings_goal'
  | 'planning_item';

export interface SyncOperation {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperationType;
  payload?: string;
  status: 'pending' | 'processing' | 'error';
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

// Shared domain types used across the API, services, and models so the transaction
// shape remains consistent from MongoDB to HTTP response.
export const TRANSACTION_TYPES = ['credit', 'debit'] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface TransactionPublic {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId: string;
  createdAt: string;
}

export interface AccountPublic {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
}

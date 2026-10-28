import mongoose from 'mongoose';
import { accountRepository } from '../repositories/account.repository.js';
import { transactionRepository } from '../repositories/transaction.repository.js';
import type { TransactionPublic, TransactionType } from '../types/transaction.js';
import { ApiError } from '../utils/api-error.js';
import type { TransactionQuery } from '../validators/transaction-query.validator.js';

// Read-side query service that returns account history plus derived pagination state.
export interface TransactionHistory {
  transactions: TransactionPublic[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const transactionQueryService = {
  async getTransactionHistory(
    accountId: string,
    query: TransactionQuery
  ): Promise<TransactionHistory> {
    const account = await accountRepository.findById(accountId);

    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    const accountObjectId = new mongoose.Types.ObjectId(accountId);
    const type = query.type as TransactionType | undefined;

    // Count and fetch are executed in parallel because the API needs both the page slice
    // and the aggregate total to build the pagination metadata.
    const [transactions, totalRecords] = await Promise.all([
      transactionRepository.findPaginatedByAccount(accountObjectId, {
        type,
        page: query.page,
        limit: query.limit
      }),
      transactionRepository.countByAccount(accountObjectId, {
        type
      })
    ]);

    const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / query.limit);

    return {
      transactions: transactions.map((transaction) => transaction.toPublic()),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalRecords,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1
      }
    };
  }
};

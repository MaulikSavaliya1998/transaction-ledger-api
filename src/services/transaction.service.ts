import mongoose from 'mongoose';
import { accountRepository } from '../repositories/account.repository.js';
import { transactionRepository } from '../repositories/transaction.repository.js';
import type { TransactionPublic } from '../types/transaction.js';
import { ApiError } from '../utils/api-error.js';
import type { CreateTransactionInput } from '../validators/transaction.validator.js';

function toMinorUnits(amount: number): number {
  const minorUnits = Math.round(amount * 100);

  if (!Number.isSafeInteger(minorUnits) || minorUnits <= 0) {
    throw ApiError.validation('Transaction amount must be greater than 0');
  }

  return minorUnits;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export const transactionService = {
  async createTransaction(
    accountId: string,
    input: CreateTransactionInput
  ): Promise<TransactionPublic> {
    const amountMinorUnits = toMinorUnits(input.amount);
    const accountObjectId = new mongoose.Types.ObjectId(accountId);
    const changeMinorUnits = input.type === 'credit' ? amountMinorUnits : -amountMinorUnits;

    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const account = await accountRepository.findById(accountId, session);

        if (!account) {
          throw ApiError.notFound('Account not found');
        }

        const existingTransaction = await transactionRepository.findByAccountAndReference(
          accountObjectId,
          input.referenceId,
          session
        );

        if (existingTransaction) {
          throw ApiError.conflict(
            'A transaction with this reference ID already exists for this account'
          );
        }

        const updatedAccount = await accountRepository.applyBalanceChange(
          accountObjectId,
          changeMinorUnits,
          session
        );

        if (!updatedAccount) {
          throw ApiError.unprocessable('Insufficient account balance for this debit transaction');
        }

        try {
          const transaction = await transactionRepository.create(
            {
              accountId: accountObjectId,
              type: input.type,
              amountMinorUnits,
              description: input.description,
              referenceId: input.referenceId
            },
            session
          );

          return transaction.toPublic();
        } catch (error) {
          if (isDuplicateKeyError(error)) {
            throw ApiError.conflict(
              'A transaction with this reference ID already exists for this account'
            );
          }

          throw error;
        }
      });
    } finally {
      await session.endSession();
    }
  }
};

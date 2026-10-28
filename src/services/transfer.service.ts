import mongoose from 'mongoose';
import { transferRepository } from '../repositories/transfer.repository.js';
import type { TransactionPublic } from '../types/transaction.js';
import { ApiError } from '../utils/api-error.js';
import type { CreateTransferInput } from '../validators/transfer.validator.js';

// Transfer results contain both ledger entries because the API should return the exact
// debit and credit effects that were recorded for the source and destination accounts.
export interface TransferResult {
  transferId: string;
  amount: number;
  sourceAccountId: string;
  destinationAccountId: string;
  debit: TransactionPublic;
  credit: TransactionPublic;
}

function toMinorUnits(amount: number): number {
  const minorUnits = Math.round(amount * 100);

  if (!Number.isSafeInteger(minorUnits) || minorUnits <= 0) {
    throw ApiError.validation('Transfer amount must be greater than 0');
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

function mapTransferError(error: unknown): ApiError {
  if (!(error instanceof Error)) {
    return ApiError.internal();
  }

  switch (error.message) {
    case 'SOURCE_ACCOUNT_NOT_FOUND':
      return ApiError.notFound('Source account not found');
    case 'DESTINATION_ACCOUNT_NOT_FOUND':
      return ApiError.notFound('Destination account not found');
    case 'INSUFFICIENT_SOURCE_BALANCE':
      return ApiError.unprocessable('Insufficient balance in the source account');
    default:
      return ApiError.internal();
  }
}

export const transferService = {
  async transfer(input: CreateTransferInput): Promise<TransferResult> {
    const amountMinorUnits = toMinorUnits(input.amount);

    const sourceAccountId = new mongoose.Types.ObjectId(input.sourceAccountId);
    const destinationAccountId = new mongoose.Types.ObjectId(input.destinationAccountId);

    // A transfer is treated as a double-entry ledger movement: one debit entry and
    // one credit entry, both created in the same MongoDB transaction to guarantee
    // atomicity and rollback on any failure.
    const session = await mongoose.startSession();

    try {
      const result = await session.withTransaction(async () => {
        try {
          return await transferRepository.executeTransfer(
            {
              sourceAccountId,
              destinationAccountId,
              amountMinorUnits,
              description: input.description,
              referenceId: input.referenceId
            },
            session
          );
        } catch (error) {
          if (error instanceof ApiError) {
            throw error;
          }

          if (
            error instanceof Error &&
            [
              'SOURCE_ACCOUNT_NOT_FOUND',
              'DESTINATION_ACCOUNT_NOT_FOUND',
              'INSUFFICIENT_SOURCE_BALANCE'
            ].includes(error.message)
          ) {
            throw mapTransferError(error);
          }

          throw error;
        }
      });

      return {
        transferId: input.referenceId,
        amount: input.amount,
        sourceAccountId: input.sourceAccountId,
        destinationAccountId: input.destinationAccountId,
        debit: result.debit,
        credit: result.credit
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (isDuplicateKeyError(error)) {
        throw ApiError.conflict('A transfer with this reference ID already exists');
      }

      throw mapTransferError(error);
    } finally {
      await session.endSession();
    }
  }
};

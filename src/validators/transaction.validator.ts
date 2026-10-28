import { z } from 'zod';
import { TRANSACTION_TYPES } from '../types/transaction.js';

// MongoDB ObjectId validation is shared by every account-scoped endpoint to keep the
// ID format consistent and reject malformed values before reaching the database.
const objectIdSchema = z
  .string({
    error: 'Account ID is required and must be a string'
  })
  .regex(/^[0-9a-fA-F]{24}$/, 'Account ID must be a valid MongoDB ObjectId');

export const accountIdParamsSchema = z.object({
  accountId: objectIdSchema
});

export const createTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, {
      error: 'Transaction type must be either credit or debit'
    }),
    amount: z
      .number({
        error: 'Transaction amount is required and must be a number'
      })
      .positive('Transaction amount must be greater than 0')
      .multipleOf(0.01, 'Transaction amount can have at most 2 decimal places')
      .max(1_000_000_000, 'Transaction amount is too large'),
    description: z
      .string({
        error: 'Transaction description is required and must be a string'
      })
      .trim()
      .min(1, 'Transaction description cannot be empty')
      .max(255, 'Transaction description cannot exceed 255 characters'),
    referenceId: z
      .string({
        error: 'Reference ID is required and must be a string'
      })
      .trim()
      .min(1, 'Reference ID cannot be empty')
      .max(100, 'Reference ID cannot exceed 100 characters')
  })
  .strict();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type AccountIdParams = z.infer<typeof accountIdParamsSchema>;

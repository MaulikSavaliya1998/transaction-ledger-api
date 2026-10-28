import { z } from 'zod';
import { TRANSACTION_TYPES } from '../types/transaction.js';

// The history endpoint accepts both a path accountId and optional query filters, so it
// uses a small reusable MongoDB ObjectId schema for safe parameter validation.
const objectIdSchema = z
  .string({
    error: 'Account ID is required and must be a string'
  })
  .regex(/^[0-9a-fA-F]{24}$/, 'Account ID must be a valid MongoDB ObjectId');

export const accountIdParamsSchema = z.object({
  accountId: objectIdSchema
});

export const transactionQuerySchema = z
  .object({
    page: z.coerce
      .number({ error: 'Page must be a number' })
      .int('Page must be an integer')
      .min(1, 'Page must be greater than or equal to 1')
      .default(1),
    limit: z.coerce
      .number({ error: 'Limit must be a number' })
      .int('Limit must be an integer')
      .min(1, 'Limit must be greater than or equal to 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    type: z
      .enum(TRANSACTION_TYPES, {
        error: 'Transaction type must be either credit or debit'
      })
      .optional()
  })
  .strict();

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;

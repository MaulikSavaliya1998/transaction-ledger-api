import { z } from 'zod';

// Transfer validation ensures the two account IDs are valid MongoDB ObjectIds and that
// the source and destination are not the same account.
const objectIdSchema = z
  .string({
    error: 'Account ID is required and must be a string'
  })
  .regex(/^[0-9a-fA-F]{24}$/, 'Account ID must be a valid MongoDB ObjectId');

export const createTransferSchema = z
  .object({
    sourceAccountId: objectIdSchema,
    destinationAccountId: objectIdSchema,
    amount: z
      .number({
        error: 'Transfer amount is required and must be a number'
      })
      .positive('Transfer amount must be greater than 0')
      .multipleOf(0.01, 'Transfer amount can have at most 2 decimal places')
      .max(1_000_000_000, 'Transfer amount is too large'),
    description: z
      .string({
        error: 'Transfer description is required and must be a string'
      })
      .trim()
      .min(1, 'Transfer description cannot be empty')
      .max(255, 'Transfer description cannot exceed 255 characters'),
    referenceId: z
      .string({
        error: 'Transfer reference ID is required and must be a string'
      })
      .trim()
      .min(1, 'Transfer reference ID cannot be empty')
      .max(100, 'Transfer reference ID cannot exceed 100 characters')
  })
  .strict()
  .refine((data) => data.sourceAccountId !== data.destinationAccountId, {
    message: 'Source and destination accounts must be different',
    path: ['destinationAccountId']
  });

export type CreateTransferInput = z.infer<typeof createTransferSchema>;

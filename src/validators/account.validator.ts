import { z } from 'zod';

export const createAccountSchema = z
  .object({
    name: z
      .string({
        error: 'Account name is required and must be a string'
      })
      .trim()
      .min(1, 'Account name cannot be empty')
      .max(120, 'Account name cannot exceed 120 characters')
  })
  .strict();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

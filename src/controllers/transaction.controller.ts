import type { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import type {
  AccountIdParams,
  CreateTransactionInput
} from '../validators/transaction.validator.js';

export const createTransaction = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { accountId } = req.params as unknown as AccountIdParams;
    const input = req.body as CreateTransactionInput;

    const transaction = await transactionService.createTransaction(accountId, input);

    res.status(201).json({
      success: true,
      data: transaction
    });
  }
);

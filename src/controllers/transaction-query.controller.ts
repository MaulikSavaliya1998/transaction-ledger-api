import type { Request, Response } from 'express';
import { transactionQueryService } from '../services/transaction-query.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import type { TransactionQuery } from '../validators/transaction-query.validator.js';
import type { AccountIdParams } from '../validators/transaction.validator.js';

export const getTransactionHistory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { accountId } = req.params as unknown as AccountIdParams;
    const query = req.validatedQuery as TransactionQuery;

    const history = await transactionQueryService.getTransactionHistory(accountId, query);

    res.status(200).json({
      success: true,
      data: history.transactions,
      meta: history.pagination
    });
  }
);

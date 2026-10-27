import type { Request, Response } from 'express';
import { accountService } from '../services/account.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import type { CreateAccountInput } from '../validators/account.validator.js';
import type { AccountIdParams } from '../validators/transaction.validator.js';

export const createAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body as CreateAccountInput;

  const account = await accountService.createAccount({ name });

  res.status(201).json({
    success: true,
    data: account
  });
});

export const getAccountBalance = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { accountId } = req.params as unknown as AccountIdParams;

    const balance = await accountService.getAccountBalance(accountId);

    res.status(200).json({
      success: true,
      data: balance
    });
  }
);

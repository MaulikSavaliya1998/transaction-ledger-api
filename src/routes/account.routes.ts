import { Router } from 'express';
import { createAccount, getAccountBalance } from '../controllers/account.controller.js';
import { getTransactionHistory } from '../controllers/transaction-query.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAccountSchema } from '../validators/account.validator.js';
import {
  accountIdParamsSchema,
  transactionQuerySchema
} from '../validators/transaction-query.validator.js';
import { transactionRouter } from './transaction.routes.js';

export const accountRouter = Router();

accountRouter.post('/', validate({ body: createAccountSchema }), createAccount);

accountRouter.get(
  '/:accountId/balance',
  validate({ params: accountIdParamsSchema }),
  getAccountBalance
);

accountRouter.get(
  '/:accountId/transactions',
  validate({
    params: accountIdParamsSchema,
    query: transactionQuerySchema
  }),
  getTransactionHistory
);

accountRouter.use('/:accountId/transactions', transactionRouter);

import { Router } from 'express';
import { createTransaction } from '../controllers/transaction.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  accountIdParamsSchema,
  createTransactionSchema
} from '../validators/transaction.validator.js';

// This nested router shares the parent accountId param so the transaction endpoint can
// validate both the account path and the request body in one place.
export const transactionRouter = Router({ mergeParams: true });

transactionRouter.post(
  '/',
  validate({
    params: accountIdParamsSchema,
    body: createTransactionSchema
  }),
  createTransaction
);

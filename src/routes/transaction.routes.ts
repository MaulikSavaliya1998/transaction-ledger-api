import { Router } from 'express';
import { createTransaction } from '../controllers/transaction.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  accountIdParamsSchema,
  createTransactionSchema
} from '../validators/transaction.validator.js';

export const transactionRouter = Router({ mergeParams: true });

transactionRouter.post(
  '/',
  validate({
    params: accountIdParamsSchema,
    body: createTransactionSchema
  }),
  createTransaction
);

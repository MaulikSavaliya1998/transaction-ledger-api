import { Router } from 'express';
import { createAccount } from '../controllers/account.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAccountSchema } from '../validators/account.validator.js';
import { transactionRouter } from './transaction.routes.js';

export const accountRouter = Router();

accountRouter.post('/', validate({ body: createAccountSchema }), createAccount);

accountRouter.use('/:accountId/transactions', transactionRouter);

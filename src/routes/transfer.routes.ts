import { Router } from 'express';
import { createTransfer } from '../controllers/transfer.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTransferSchema } from '../validators/transfer.validator.js';

export const transferRouter = Router();

transferRouter.post('/', validate({ body: createTransferSchema }), createTransfer);

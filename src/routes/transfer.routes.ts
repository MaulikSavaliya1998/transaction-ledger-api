import { Router } from 'express';
import { createTransfer } from '../controllers/transfer.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTransferSchema } from '../validators/transfer.validator.js';

// Transfers are intentionally handled by a dedicated route because they have a more
// complex validation and atomicity model than a simple transaction creation.
export const transferRouter = Router();

transferRouter.post('/', validate({ body: createTransferSchema }), createTransfer);

import { Router } from 'express';
import { accountRouter } from './account.routes.js';
import { healthRouter } from './health.routes.js';
import { transferRouter } from './transfer.routes.js';

// Versioned API router that groups all endpoints under /api/v1.
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/accounts', accountRouter);
apiRouter.use('/transfers', transferRouter);

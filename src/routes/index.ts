import { Router } from 'express';
import { accountRouter } from './account.routes.js';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/accounts', accountRouter);

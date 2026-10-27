import { Router } from 'express';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);

// Account and transaction routes will be registered in later phases.

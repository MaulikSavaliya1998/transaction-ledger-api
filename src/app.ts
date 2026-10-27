import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler, notFoundMiddleware } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rate-limit.middleware.js';
import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(helmet());

  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin,
      credentials: env.corsOrigin !== '*'
    })
  );

  app.use(
    pinoHttp({
      level: env.logLevel,
      genReqId: (req) => req.headers['x-request-id'] as string
    })
  );

  app.use(requestIdMiddleware);

  app.use(express.json({ limit: '100kb' }));

  app.use('/api/v1', apiRateLimiter, apiRouter);

  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Transaction Ledger API is running',
        documentation: '/api/v1/health'
      }
    });
  });

  app.use(notFoundMiddleware);

  app.use(errorHandler);

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Transaction Ledger API is running',
        documentation: '/api/v1/health'
      }
    });
  });

  return app;
}

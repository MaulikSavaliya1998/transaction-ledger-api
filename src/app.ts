import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { loadOpenApiDocument } from './config/openapi.js';
import { errorHandler, notFoundMiddleware } from './middlewares/error.middleware.js';
import { apiRateLimiter } from './middlewares/rate-limit.middleware.js';
import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();
  const openApiDocument = loadOpenApiDocument();

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

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  app.use('/api/v1', apiRateLimiter, apiRouter);

  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Transaction Ledger API is running',
        documentation: '/api-docs',
        openapi: '/openapi.json'
      }
    });
  });

  app.use(notFoundMiddleware);

  app.use(errorHandler);

  return app;
}

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

// Application factory keeps server bootstrap logic separate from the Express wiring.
// This makes it easier to instantiate the app in tests without starting the HTTP
// server itself.
export function createApp() {
  const app = express();
  const openApiDocument = loadOpenApiDocument();

  app.disable('x-powered-by');

  // Helmet adds a baseline set of security headers for all responses.
  app.use(helmet());

  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin,
      credentials: env.corsOrigin !== '*'
    })
  );

  // Request logging is kept lightweight but includes the request ID in every log entry.
  app.use(
    pinoHttp({
      level: env.logLevel,
      genReqId: (req) => req.headers['x-request-id'] as string
    })
  );

  app.use(requestIdMiddleware);

  // 100KB body limit is enough for standard JSON payloads while protecting the service
  // from extremely large request bodies.
  app.use(express.json({ limit: '100kb' }));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  // Global API rate limiting is applied before route handlers to protect the service.
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

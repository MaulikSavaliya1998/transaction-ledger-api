import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';

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
      level: env.logLevel
    })
  );

  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        service: 'transaction-ledger-api',
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime())
      }
    });
  });

  return app;
}

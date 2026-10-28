import { Router } from 'express';

// Minimal health endpoint used by load balancers, Docker health checks, and quick
// smoke tests during deployment.
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'transaction-ledger-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime())
    }
  });
});

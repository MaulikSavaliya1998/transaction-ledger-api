import type { Server } from 'node:http';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  const server: Server = app.listen(env.port, () => {
    console.log(`API running at http://localhost:${env.port}`);
    console.log(`Health check: http://localhost:${env.port}/api/v1/health`);
  });

  let isShuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`${signal} received. Starting graceful shutdown...`);

    const forceExitTimeout = setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);

    forceExitTimeout.unref();

    server.close(async (serverError) => {
      try {
        if (serverError) {
          throw serverError;
        }

        await disconnectDatabase();
        console.log('Graceful shutdown completed.');
        process.exit(0);
      } catch (error) {
        console.error('Shutdown failed:', error);
        process.exit(1);
      }
    });
  }

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
    void shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    void shutdown('uncaughtException');
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});

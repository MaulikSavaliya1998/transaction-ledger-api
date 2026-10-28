import 'dotenv/config';

// Centralizes environment configuration so all runtime settings are validated once at
// startup and fail fast if required values are missing.
function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

// Port must stay within standard TCP range to avoid invalid server bindings.
function getPort(): number {
  const value = Number(process.env.PORT ?? 3000);

  if (!Number.isInteger(value) || value <= 0 || value > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535');
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: getPort(),
  // MongoDB URI is mandatory because the API cannot operate without a backing store.
  mongoUri: getRequiredEnv('MONGODB_URI'),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*'
} as const;

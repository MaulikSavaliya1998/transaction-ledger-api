import 'dotenv/config';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

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
  mongoUri: getRequiredEnv('MONGODB_URI'),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*'
} as const;

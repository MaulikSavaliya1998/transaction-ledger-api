import mongoose from 'mongoose';
import { env } from './env.js';

// Database bootstrapping is isolated here so the app startup path stays simple and
// the connection lifecycle can be reused in tests and graceful shutdown flows.
export async function connectDatabase(): Promise<void> {
  // Auto-index creation is convenient in local/dev environments but should stay off in
  // production to avoid unexpected index drift during deploys.
  mongoose.set('autoIndex', env.nodeEnv !== 'production');

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}

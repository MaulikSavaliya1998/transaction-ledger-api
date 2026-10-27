import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
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

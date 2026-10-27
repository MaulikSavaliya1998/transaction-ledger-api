import { config } from 'dotenv';
import mongoose from 'mongoose';
import { Account } from '../src/models/account.model.js';
import { Transaction } from '../src/models/transaction.model.js';

config();

async function createIndexes(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000
  });

  await Account.syncIndexes();
  await Transaction.syncIndexes();

  console.log('Database indexes synchronized successfully.');

  await mongoose.disconnect();
}

createIndexes().catch((error: unknown) => {
  console.error('Failed to synchronize database indexes:', error);
  process.exit(1);
});

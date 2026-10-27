import { config } from 'dotenv';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll } from 'vitest';

config();

const testMongoUri =
  process.env.TEST_MONGODB_URI ??
  'mongodb://localhost:27017/transaction_ledger_test?replicaSet=rs0';

beforeAll(async () => {
  mongoose.set('autoIndex', true);

  await mongoose.connect(testMongoUri, {
    serverSelectionTimeoutMS: 5000
  });
});

afterEach(async () => {
  const collections = await mongoose.connection.db?.collections();

  if (!collections) {
    return;
  }

  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});

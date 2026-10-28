import request from 'supertest';
import { createApp } from '../../src/app.js';

// Test helpers centralize the repeated API boilerplate so the spec files stay focused on
// behavior instead of request setup.
const app = createApp();

export const api = request(app);

export async function createAccount(name: string): Promise<string> {
  const response = await api.post('/api/v1/accounts').send({ name });

  if (response.status !== 201) {
    throw new Error(`Account creation failed: ${JSON.stringify(response.body)}`);
  }

  return response.body.data.id;
}

export async function createTransaction(accountId: string, body: Record<string, unknown>) {
  return api.post(`/api/v1/accounts/${accountId}/transactions`).send(body);
}

export async function getBalanceFromDatabase(accountId: string): Promise<number> {
  const { Account } = await import('../../src/models/account.model.js');

  const account = await Account.findById(accountId);

  if (!account) {
    throw new Error('Test account not found');
  }

  return account.balanceMinorUnits;
}

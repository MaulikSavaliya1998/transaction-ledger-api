import { beforeAll, describe, expect, it } from 'vitest';
import { createAccount, createTransaction } from '../helpers/api.js';

describe('Transaction validation', () => {
  let accountId: string;

  beforeAll(async () => {
    accountId = await createAccount('Validation User');
  });

  it('rejects an invalid transaction type', async () => {
    const response = await createTransaction(accountId, {
      type: 'withdraw',
      amount: 10,
      description: 'Invalid type',
      referenceId: 'INVALID-TYPE'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects zero and negative amounts', async () => {
    for (const amount of [0, -10]) {
      const response = await createTransaction(accountId, {
        type: 'credit',
        amount,
        description: 'Invalid amount',
        referenceId: `INVALID-AMOUNT-${amount}`
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('rejects a missing reference ID', async () => {
    const response = await createTransaction(accountId, {
      type: 'credit',
      amount: 10,
      description: 'Missing reference'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid account ID format', async () => {
    const response = await createTransaction('invalid-id', {
      type: 'credit',
      amount: 10,
      description: 'Invalid account',
      referenceId: 'INVALID-ACCOUNT-ID'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for a valid but nonexistent account ID', async () => {
    const response = await createTransaction('64b64b64b64b64b64b64b64b', {
      type: 'credit',
      amount: 10,
      description: 'Missing account',
      referenceId: 'MISSING-ACCOUNT'
    });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

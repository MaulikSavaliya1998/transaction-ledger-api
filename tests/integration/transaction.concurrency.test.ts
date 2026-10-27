import { describe, expect, it } from 'vitest';
import { createAccount, createTransaction, getBalanceFromDatabase } from '../helpers/api.js';

describe('Transaction concurrency', () => {
  it('prevents concurrent debits from overdrawing the account', async () => {
    const accountId = await createAccount('Concurrency User');

    await createTransaction(accountId, {
      type: 'credit',
      amount: 100,
      description: 'Initial credit',
      referenceId: 'CONCURRENCY-CREDIT'
    });

    const debitRequests = [80, 80].map((amount, index) =>
      createTransaction(accountId, {
        type: 'debit',
        amount,
        description: `Concurrent debit ${index + 1}`,
        referenceId: `CONCURRENCY-DEBIT-${index + 1}`
      })
    );

    const responses = await Promise.all(debitRequests);

    const successfulResponses = responses.filter((response) => response.status === 201);

    const rejectedResponses = responses.filter((response) => response.status === 422);

    expect(successfulResponses).toHaveLength(1);
    expect(rejectedResponses).toHaveLength(1);

    const balance = await getBalanceFromDatabase(accountId);

    expect(balance).toBe(2000);
  });

  it('allows concurrent credits and maintains the exact total', async () => {
    const accountId = await createAccount('Concurrent Credit User');

    const creditRequests = [10, 20, 30, 40].map((amount, index) =>
      createTransaction(accountId, {
        type: 'credit',
        amount,
        description: `Concurrent credit ${index + 1}`,
        referenceId: `CONCURRENT-CREDIT-${index + 1}`
      })
    );

    const responses = await Promise.all(creditRequests);

    responses.forEach((response) => {
      expect(response.status).toBe(201);
    });

    const balance = await getBalanceFromDatabase(accountId);

    expect(balance).toBe(10000);
  });
});

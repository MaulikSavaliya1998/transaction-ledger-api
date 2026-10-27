import { beforeEach, describe, expect, it } from 'vitest';
import { api, createAccount, createTransaction } from '../helpers/api.js';

describe('Transaction read APIs', () => {
  let accountId: string;

  beforeEach(async () => {
    accountId = await createAccount('Read API User');

    const transactions = [
      { type: 'credit', amount: 10, referenceId: 'READ-1' },
      { type: 'debit', amount: 5, referenceId: 'READ-2' },
      { type: 'credit', amount: 20, referenceId: 'READ-3' }
    ];

    for (const transaction of transactions) {
      const response = await createTransaction(accountId, {
        ...transaction,
        description: `${transaction.type} transaction`
      });

      expect(response.status).toBe(201);
    }
  });

  it('returns the current account balance', async () => {
    const response = await api.get(`/api/v1/accounts/${accountId}/balance`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      accountId,
      balance: 25
    });
  });

  it('returns transactions latest-first', async () => {
    const response = await api
      .get(`/api/v1/accounts/${accountId}/transactions`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);

    expect(response.body.data.map((item: { referenceId: string }) => item.referenceId)).toEqual([
      'READ-3',
      'READ-2',
      'READ-1'
    ]);

    expect(response.body.meta).toEqual({
      page: 1,
      limit: 10,
      totalRecords: 3,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    });
  });

  it('filters transactions by credit type', async () => {
    const response = await api
      .get(`/api/v1/accounts/${accountId}/transactions`)
      .query({ page: 1, limit: 10, type: 'credit' });

    expect(response.status).toBe(200);

    expect(response.body.data.map((item: { referenceId: string }) => item.referenceId)).toEqual([
      'READ-3',
      'READ-1'
    ]);

    expect(response.body.meta.totalRecords).toBe(2);
  });

  it('filters transactions by debit type', async () => {
    const response = await api
      .get(`/api/v1/accounts/${accountId}/transactions`)
      .query({ page: 1, limit: 10, type: 'debit' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].referenceId).toBe('READ-2');
  });

  it('paginates transaction history correctly', async () => {
    const firstPage = await api
      .get(`/api/v1/accounts/${accountId}/transactions`)
      .query({ page: 1, limit: 2 });

    const secondPage = await api
      .get(`/api/v1/accounts/${accountId}/transactions`)
      .query({ page: 2, limit: 2 });

    expect(firstPage.status).toBe(200);
    expect(firstPage.body.data).toHaveLength(2);
    expect(firstPage.body.meta.totalRecords).toBe(3);
    expect(firstPage.body.meta.totalPages).toBe(2);
    expect(firstPage.body.meta.hasNextPage).toBe(true);
    expect(firstPage.body.meta.hasPreviousPage).toBe(false);

    expect(secondPage.status).toBe(200);
    expect(secondPage.body.data).toHaveLength(1);
    expect(secondPage.body.meta.page).toBe(2);
    expect(secondPage.body.meta.hasNextPage).toBe(false);
    expect(secondPage.body.meta.hasPreviousPage).toBe(true);
  });

  it('rejects invalid pagination parameters', async () => {
    const response = await api
      .get(`/api/v1/accounts/${accountId}/transactions`)
      .query({ page: 0, limit: 10 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

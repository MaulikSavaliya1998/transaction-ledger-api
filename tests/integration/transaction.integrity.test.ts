import { describe, expect, it } from 'vitest';
import { createAccount, createTransaction, getBalanceFromDatabase } from '../helpers/api.js';

describe('Transaction integrity', () => {
  it('credits and debits maintain the correct balance', async () => {
    const accountId = await createAccount('Balance Flow User');

    await createTransaction(accountId, {
      type: 'credit',
      amount: 100,
      description: 'Credit 100',
      referenceId: 'FLOW-CREDIT-100'
    });

    await createTransaction(accountId, {
      type: 'credit',
      amount: 50,
      description: 'Credit 50',
      referenceId: 'FLOW-CREDIT-50'
    });

    await createTransaction(accountId, {
      type: 'debit',
      amount: 30,
      description: 'Debit 30',
      referenceId: 'FLOW-DEBIT-30'
    });

    await createTransaction(accountId, {
      type: 'debit',
      amount: 20,
      description: 'Debit 20',
      referenceId: 'FLOW-DEBIT-20'
    });

    const balance = await getBalanceFromDatabase(accountId);

    expect(balance).toBe(10000);
  });

  it('rejects a debit exceeding the available balance without changing it', async () => {
    const accountId = await createAccount('Insufficient Balance User');

    await createTransaction(accountId, {
      type: 'credit',
      amount: 100,
      description: 'Credit 100',
      referenceId: 'INSUFFICIENT-CREDIT'
    });

    const response = await createTransaction(accountId, {
      type: 'debit',
      amount: 150,
      description: 'Overdraft attempt',
      referenceId: 'INSUFFICIENT-DEBIT'
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');

    const balance = await getBalanceFromDatabase(accountId);

    expect(balance).toBe(10000);
  });

  it('does not create a transaction or change balance for a duplicate reference', async () => {
    const accountId = await createAccount('Duplicate Reference User');

    const first = await createTransaction(accountId, {
      type: 'credit',
      amount: 75,
      description: 'First credit',
      referenceId: 'DUPLICATE-REF'
    });

    const duplicate = await createTransaction(accountId, {
      type: 'credit',
      amount: 75,
      description: 'Duplicate credit',
      referenceId: 'DUPLICATE-REF'
    });

    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('CONFLICT');

    const balance = await getBalanceFromDatabase(accountId);

    expect(balance).toBe(7500);
  });

  it('allows the same reference ID for different accounts', async () => {
    const firstAccountId = await createAccount('Reference Account One');
    const secondAccountId = await createAccount('Reference Account Two');

    const first = await createTransaction(firstAccountId, {
      type: 'credit',
      amount: 25,
      description: 'First account credit',
      referenceId: 'SHARED-REF'
    });

    const second = await createTransaction(secondAccountId, {
      type: 'credit',
      amount: 40,
      description: 'Second account credit',
      referenceId: 'SHARED-REF'
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    expect(await getBalanceFromDatabase(firstAccountId)).toBe(2500);
    expect(await getBalanceFromDatabase(secondAccountId)).toBe(4000);
  });

  it('rolls back a transaction when the ledger insert fails', async () => {
    const accountId = await createAccount('Rollback User');

    await createTransaction(accountId, {
      type: 'credit',
      amount: 80,
      description: 'Successful credit',
      referenceId: 'ROLLBACK-CREDIT'
    });

    const response = await createTransaction(accountId, {
      type: 'debit',
      amount: 30,
      description: 'Attempted duplicate debit',
      referenceId: 'ROLLBACK-CREDIT'
    });

    expect(response.status).toBe(409);

    const balance = await getBalanceFromDatabase(accountId);

    expect(balance).toBe(8000);

    const { Transaction } = await import('../../src/models/transaction.model.js');

    const transactionCount = await Transaction.countDocuments({
      accountId,
      referenceId: 'ROLLBACK-CREDIT'
    });

    expect(transactionCount).toBe(1);
  });
});

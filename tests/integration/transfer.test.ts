import { describe, expect, it } from 'vitest';
import { api, createAccount, createTransaction, getBalanceFromDatabase } from '../helpers/api.js';

async function createTransfer(body: Record<string, unknown>) {
  return api.post('/api/v1/transfers').send(body);
}

describe('Money transfer', () => {
  it('transfers money atomically between two accounts', async () => {
    const sourceAccountId = await createAccount('Transfer Source');
    const destinationAccountId = await createAccount('Transfer Destination');

    await createTransaction(sourceAccountId, {
      type: 'credit',
      amount: 100,
      description: 'Initial funding',
      referenceId: 'TRANSFER-TEST-FUND'
    });

    const response = await createTransfer({
      sourceAccountId,
      destinationAccountId,
      amount: 30,
      description: 'Transfer to destination',
      referenceId: 'TRANSFER-TEST-001'
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.debit.referenceId).toBe('TRANSFER-TEST-001:DEBIT');
    expect(response.body.data.credit.referenceId).toBe('TRANSFER-TEST-001:CREDIT');

    expect(await getBalanceFromDatabase(sourceAccountId)).toBe(7000);
    expect(await getBalanceFromDatabase(destinationAccountId)).toBe(3000);
  });

  it('rejects a transfer when source balance is insufficient', async () => {
    const sourceAccountId = await createAccount('Poor Source');
    const destinationAccountId = await createAccount('Transfer Target');

    await createTransaction(sourceAccountId, {
      type: 'credit',
      amount: 10,
      description: 'Small funding',
      referenceId: 'POOR-SOURCE-FUND'
    });

    const response = await createTransfer({
      sourceAccountId,
      destinationAccountId,
      amount: 50,
      description: 'Insufficient transfer',
      referenceId: 'TRANSFER-TEST-002'
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('UNPROCESSABLE_ENTITY');

    expect(await getBalanceFromDatabase(sourceAccountId)).toBe(1000);
    expect(await getBalanceFromDatabase(destinationAccountId)).toBe(0);
  });

  it('rejects transfers to the same account', async () => {
    const accountId = await createAccount('Same Account Transfer');

    const response = await createTransfer({
      sourceAccountId: accountId,
      destinationAccountId: accountId,
      amount: 10,
      description: 'Self transfer',
      referenceId: 'TRANSFER-TEST-003'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when destination account does not exist', async () => {
    const sourceAccountId = await createAccount('Existing Source');

    await createTransaction(sourceAccountId, {
      type: 'credit',
      amount: 50,
      description: 'Funding',
      referenceId: 'EXISTING-SOURCE-FUND'
    });

    const response = await createTransfer({
      sourceAccountId,
      destinationAccountId: '64b64b64b64b64b64b64b64b',
      amount: 10,
      description: 'Missing destination',
      referenceId: 'TRANSFER-TEST-004'
    });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');

    expect(await getBalanceFromDatabase(sourceAccountId)).toBe(5000);
  });

  it('rejects duplicate transfer reference IDs', async () => {
    const sourceAccountId = await createAccount('Duplicate Transfer Source');
    const destinationAccountId = await createAccount('Duplicate Transfer Destination');

    await createTransaction(sourceAccountId, {
      type: 'credit',
      amount: 100,
      description: 'Funding',
      referenceId: 'DUPLICATE-TRANSFER-FUND'
    });

    const transferBody = {
      sourceAccountId,
      destinationAccountId,
      amount: 20,
      description: 'Duplicate transfer',
      referenceId: 'DUPLICATE-TRANSFER-REF'
    };

    const first = await createTransfer(transferBody);
    const duplicate = await createTransfer(transferBody);

    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(409);

    expect(await getBalanceFromDatabase(sourceAccountId)).toBe(8000);
    expect(await getBalanceFromDatabase(destinationAccountId)).toBe(2000);
  });
});

import { describe, expect, it } from 'vitest';
import { api } from '../helpers/api.js';

describe('API documentation', () => {
  it('serves the OpenAPI JSON contract', async () => {
    const response = await api.get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.info.title).toBe('Transaction Ledger API');
    expect(response.body.paths).toHaveProperty('/accounts');
    expect(response.body.paths).toHaveProperty('/transfers');
  });

  it('serves Swagger UI', async () => {
    const response = await api.get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });
});

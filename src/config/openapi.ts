import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export type OpenApiDocument = Record<string, unknown>;

// The OpenAPI contract is stored as YAML so it remains human-readable while still
// being served by the API and exposed to Swagger UI.
export function loadOpenApiDocument(): OpenApiDocument {
  const filePath = path.resolve(process.cwd(), 'openapi.yaml');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const document = parse(fileContent) as OpenApiDocument;

  if (!document || typeof document !== 'object') {
    throw new Error('Invalid OpenAPI document: openapi.yaml must contain an object');
  }

  return document;
}

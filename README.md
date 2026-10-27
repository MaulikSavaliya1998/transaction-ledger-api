# Transaction Ledger API

A production-style REST API for managing accounts, immutable credit/debit transactions, balances, transaction history, and atomic money transfers.

Built with:

- Node.js 22
- TypeScript
- Express.js
- MongoDB
- Mongoose
- Zod
- Vitest
- Supertest
- Docker

## Features

- Create accounts with system-generated IDs and zero initial balance.
- Create immutable credit and debit transactions.
- Enforce unique transaction reference IDs per account.
- Reject debits with insufficient balance.
- Maintain account balance atomically with ledger entries.
- Retrieve current account balance.
- Retrieve transaction history with filtering, sorting, and pagination.
- Transfer money atomically between two accounts.
- Structured validation and consistent error responses.
- OpenAPI documentation and Swagger UI.
- Integration tests for integrity, concurrency, validation, and transfers.

## Project Structure

```text
src/
├── config/          # Environment, database, OpenAPI configuration
├── controllers/     # HTTP request/response handling
├── middlewares/     # Validation, errors, logging, rate limiting
├── models/          # Mongoose schemas and indexes
├── repositories/    # Database access layer
├── routes/          # Express route definitions
├── services/        # Business logic
├── types/           # Shared TypeScript types
├── utils/          # API errors and async helpers
├── validators/      # Zod request schemas
├── app.ts           # Express application
└── server.ts       # Server bootstrap and graceful shutdown
```

## Prerequisites

- Node.js 22 or later
- npm 10 or later
- Docker and Docker Compose

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Start MongoDB:

```bash
docker compose up -d mongodb
```

4. Initialize the MongoDB replica set once:

```bash
docker exec -it transaction-ledger-mongodb mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
```

5. Create database indexes:

```bash
npm run db:indexes
```

6. Start the API:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:3000
```

Swagger UI:

```text
http://localhost:3000/api-docs
```

OpenAPI JSON:

```text
http://localhost:3000/openapi.json
```

## API Endpoints

| Method | Endpoint                                   | Description                     |
| ------ | ------------------------------------------ | ------------------------------- |
| POST   | `/api/v1/accounts`                         | Create an account               |
| GET    | `/api/v1/accounts/:accountId/balance`      | Get account balance             |
| POST   | `/api/v1/accounts/:accountId/transactions` | Create credit/debit transaction |
| GET    | `/api/v1/accounts/:accountId/transactions` | Get transaction history         |
| POST   | `/api/v1/transfers`                        | Transfer money between accounts |
| GET    | `/api/v1/health`                           | Health check                    |

## Example: Create Account

```bash
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{"name":"Maulik Savaliya"}'
```

## Example: Credit Transaction

```bash
curl -X POST http://localhost:3000/api/v1/accounts/ACCOUNT_ID/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"credit","amount":100,"description":"Initial deposit","referenceId":"CREDIT-001"}'
```

## Example: Debit Transaction

```bash
curl -X POST http://localhost:3000/api/v1/accounts/ACCOUNT_ID/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"debit","amount":30,"description":"Withdrawal","referenceId":"DEBIT-001"}'
```

## Example: Transaction History

```bash
curl "http://localhost:3000/api/v1/accounts/ACCOUNT_ID/transactions?page=1&limit=10&type=credit"
```

## Example: Money Transfer

```bash
curl -X POST http://localhost:3000/api/v1/transfers \
  -H "Content-Type: application/json" \
  -d '{"sourceAccountId":"SOURCE_ACCOUNT_ID","destinationAccountId":"DESTINATION_ACCOUNT_ID","amount":30,"description":"Transfer","referenceId":"TRANSFER-001"}'
```

## Data Integrity

- Account balances start at zero.
- Transactions are immutable; the API exposes no update or delete endpoint.
- Transaction creation and balance updates run in one MongoDB transaction.
- Duplicate `referenceId` values are rejected per account using a compound unique index.
- Debits use a conditional atomic balance update to prevent concurrent overdrafts.
- Transfers create one debit and one credit entry and roll back completely on failure.

## Testing

Start MongoDB first:

```bash
docker compose up -d mongodb
```

Run tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run coverage:

```bash
npm run test:coverage
```

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
```

## Docker

Run MongoDB only:

```bash
docker compose up -d mongodb
```

Run the full application:

```bash
docker compose up --build
```

## Assumptions

- Amounts are accepted and returned in decimal currency units with up to two decimal places.
- Amounts are stored internally as integer minor units to avoid floating-point precision issues.
- A transaction `referenceId` must be unique within an account but may be reused by another account.
- Transfer references create derived ledger references: `REFERENCE:DEBIT` and `REFERENCE:CREDIT`.
- Transactions cannot be updated or deleted through the API.
- Authentication and authorization are not implemented because they were not part of the assignment.
- The API is designed for a single-region deployment; distributed deployments would require a shared rate-limit store and horizontal-scaling considerations.

## Submission

- Source code: this repository.
- README: this file.
- API documentation: `/api-docs` and `/openapi.json`.
- Assumptions: listed above.

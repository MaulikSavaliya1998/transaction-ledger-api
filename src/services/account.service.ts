import { accountRepository } from '../repositories/account.repository.js';
import type { AccountPublic } from '../types/transaction.js';
import { ApiError } from '../utils/api-error.js';
import type { CreateAccountInput } from '../validators/account.validator.js';

// Service layer owns the business rules and keeps database access contained in the
// repository layer.
export const accountService = {
  async createAccount(input: CreateAccountInput): Promise<AccountPublic> {
    const account = await accountRepository.create({
      name: input.name
    });

    return account.toPublic();
  },

  async getAccountBalance(accountId: string): Promise<{
    accountId: string;
    balance: number;
  }> {
    const account = await accountRepository.findById(accountId);

    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    return {
      accountId: account._id.toString(),
      balance: account.balanceMinorUnits / 100
    };
  }
};

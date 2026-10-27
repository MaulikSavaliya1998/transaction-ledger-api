import { accountRepository } from '../repositories/account.repository.js';
import type { AccountPublic } from '../types/transaction.js';
import type { CreateAccountInput } from '../validators/account.validator.js';

export const accountService = {
  async createAccount(input: CreateAccountInput): Promise<AccountPublic> {
    const account = await accountRepository.create({
      name: input.name
    });

    return account.toPublic();
  }
};

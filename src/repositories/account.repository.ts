import { Account, type AccountDocument } from '../models/account.model.js';

export interface CreateAccountData {
  name: string;
}

export const accountRepository = {
  async create(data: CreateAccountData): Promise<AccountDocument> {
    return Account.create({
      name: data.name,
      balanceMinorUnits: 0
    });
  },

  async findById(accountId: string): Promise<AccountDocument | null> {
    return Account.findById(accountId);
  }
};

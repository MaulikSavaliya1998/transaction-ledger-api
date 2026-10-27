import mongoose from 'mongoose';
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

  async findById(
    accountId: string,
    session?: mongoose.ClientSession
  ): Promise<AccountDocument | null> {
    return Account.findById(accountId).session(session ?? null);
  },

  async applyBalanceChange(
    accountId: mongoose.Types.ObjectId,
    changeMinorUnits: number,
    session: mongoose.ClientSession
  ): Promise<AccountDocument | null> {
    const filter: Record<string, unknown> = {
      _id: accountId
    };

    if (changeMinorUnits < 0) {
      filter.balanceMinorUnits = { $gte: Math.abs(changeMinorUnits) };
    }

    return Account.findOneAndUpdate(
      filter,
      { $inc: { balanceMinorUnits: changeMinorUnits } },
      {
        new: true,
        session
      }
    );
  }
};

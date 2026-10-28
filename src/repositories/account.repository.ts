import mongoose from 'mongoose';
import { Account, type AccountDocument } from '../models/account.model.js';

export interface CreateAccountData {
  name: string;
}

// Repository isolates the MongoDB operations for account records so the service layer
// can stay focused on business rules.
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

    // The conditional balance check is crucial for debit operations: MongoDB applies
    // the $inc only when the existing balance is large enough, which prevents
    // overdrafts even when multiple debits arrive concurrently.
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

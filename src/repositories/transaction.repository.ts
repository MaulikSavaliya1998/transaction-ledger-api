import mongoose from 'mongoose';
import { Transaction, type TransactionDocument } from '../models/transaction.model.js';
import type { TransactionType } from '../types/transaction.js';

export interface CreateTransactionData {
  accountId: mongoose.Types.ObjectId;
  type: TransactionType;
  amountMinorUnits: number;
  description: string;
  referenceId: string;
}

// Transaction repository encapsulates the read/write logic for the immutable ledger
// records and keeps the service code free of database-specific statements.
export const transactionRepository = {
  async findByAccountAndReference(
    accountId: mongoose.Types.ObjectId,
    referenceId: string,
    session?: mongoose.ClientSession
  ): Promise<TransactionDocument | null> {
    return Transaction.findOne({ accountId, referenceId }).session(session ?? null);
  },

  async create(
    data: CreateTransactionData,
    session?: mongoose.ClientSession
  ): Promise<TransactionDocument> {
    const [transaction] = await Transaction.create([data], {
      session
    });

    return transaction;
  },

  async findPaginatedByAccount(
    accountId: mongoose.Types.ObjectId,
    options: {
      type?: TransactionType;
      page: number;
      limit: number;
    },
    session?: mongoose.ClientSession
  ): Promise<TransactionDocument[]> {
    const filter: Record<string, unknown> = {
      accountId
    };

    if (options.type) {
      filter.type = options.type;
    }

    const skip = (options.page - 1) * options.limit;

    return Transaction.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(options.limit)
      .session(session ?? null);
  },

  async countByAccount(
    accountId: mongoose.Types.ObjectId,
    options: {
      type?: TransactionType;
    },
    session?: mongoose.ClientSession
  ): Promise<number> {
    const filter: Record<string, unknown> = {
      accountId
    };

    if (options.type) {
      filter.type = options.type;
    }

    return Transaction.countDocuments(filter).session(session ?? null);
  }
};

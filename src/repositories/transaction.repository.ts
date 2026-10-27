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
  }
};

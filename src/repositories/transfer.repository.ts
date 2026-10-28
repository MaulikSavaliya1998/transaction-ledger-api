import mongoose from 'mongoose';
import type { TransactionPublic } from '../types/transaction.js';
import { ApiError } from '../utils/api-error.js';
import { accountRepository } from './account.repository.js';
import { transactionRepository } from './transaction.repository.js';

export interface TransferData {
  sourceAccountId: mongoose.Types.ObjectId;
  destinationAccountId: mongoose.Types.ObjectId;
  amountMinorUnits: number;
  description: string;
  referenceId: string;
}

// Transfer repository handles the ledger rules for moving money between two accounts.
export const transferRepository = {
  async executeTransfer(
    data: TransferData,
    session: mongoose.ClientSession
  ): Promise<{
    debit: TransactionPublic;
    credit: TransactionPublic;
  }> {
    const sourceAccount = await accountRepository.findById(
      data.sourceAccountId.toString(),
      session
    );

    if (!sourceAccount) {
      throw new Error('SOURCE_ACCOUNT_NOT_FOUND');
    }

    const destinationAccount = await accountRepository.findById(
      data.destinationAccountId.toString(),
      session
    );

    if (!destinationAccount) {
      throw new Error('DESTINATION_ACCOUNT_NOT_FOUND');
    }

    // Transfer IDs are intentionally derived per side of the ledger so the same
    // external reference can be reused across accounts while still keeping the
    // internal uniqueness rule scoped to each account.
    const existingDebit = await transactionRepository.findByAccountAndReference(
      data.sourceAccountId,
      `${data.referenceId}:DEBIT`,
      session
    );

    if (existingDebit) {
      throw ApiError.conflict('A transfer with this reference ID already exists');
    }

    const existingCredit = await transactionRepository.findByAccountAndReference(
      data.destinationAccountId,
      `${data.referenceId}:CREDIT`,
      session
    );

    if (existingCredit) {
      throw ApiError.conflict('A transfer with this reference ID already exists');
    }

    const updatedSourceAccount = await accountRepository.applyBalanceChange(
      data.sourceAccountId,
      -data.amountMinorUnits,
      session
    );

    if (!updatedSourceAccount) {
      throw new Error('INSUFFICIENT_SOURCE_BALANCE');
    }

    const updatedDestinationAccount = await accountRepository.applyBalanceChange(
      data.destinationAccountId,
      data.amountMinorUnits,
      session
    );

    if (!updatedDestinationAccount) {
      throw new Error('DESTINATION_BALANCE_UPDATE_FAILED');
    }

    const debit = await transactionRepository.create(
      {
        accountId: data.sourceAccountId,
        type: 'debit',
        amountMinorUnits: data.amountMinorUnits,
        description: data.description,
        referenceId: `${data.referenceId}:DEBIT`
      },
      session
    );

    const credit = await transactionRepository.create(
      {
        accountId: data.destinationAccountId,
        type: 'credit',
        amountMinorUnits: data.amountMinorUnits,
        description: data.description,
        referenceId: `${data.referenceId}:CREDIT`
      },
      session
    );

    return {
      debit: debit.toPublic(),
      credit: credit.toPublic()
    };
  }
};

import mongoose, { Schema, type Model } from 'mongoose';
import {
  TRANSACTION_TYPES,
  type TransactionPublic,
  type TransactionType
} from '../types/transaction.js';

export interface TransactionDocument extends mongoose.Document {
  accountId: mongoose.Types.ObjectId;
  type: TransactionType;
  amountMinorUnits: number;
  description: string;
  referenceId: string;
  createdAt: Date;
  updatedAt: Date;

  toPublic(): TransactionPublic;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account ID is required'],
      immutable: true
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: TRANSACTION_TYPES,
        message: 'Transaction type must be either credit or debit'
      },
      immutable: true
    },
    amountMinorUnits: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [1, 'Transaction amount must be greater than 0'],
      immutable: true
    },
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
      trim: true,
      minlength: [1, 'Transaction description cannot be empty'],
      maxlength: [255, 'Transaction description cannot exceed 255 characters'],
      immutable: true
    },
    referenceId: {
      type: String,
      required: [true, 'Reference ID is required'],
      trim: true,
      minlength: [1, 'Reference ID cannot be empty'],
      maxlength: [100, 'Reference ID cannot exceed 100 characters'],
      immutable: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        const serialized = ret as Record<string, unknown>;

        serialized.id = serialized._id?.toString();
        serialized.accountId = serialized.accountId?.toString();
        delete serialized._id;
        delete serialized.amountMinorUnits;

        return serialized;
      }
    }
  }
);

transactionSchema.methods.toPublic = function (): TransactionPublic {
  return {
    id: this._id.toString(),
    accountId: this.accountId.toString(),
    type: this.type,
    amount: this.amountMinorUnits / 100,
    description: this.description,
    referenceId: this.referenceId,
    createdAt: this.createdAt.toISOString()
  };
};

transactionSchema.index(
  { accountId: 1, referenceId: 1 },
  {
    unique: true,
    name: 'uniq_account_reference'
  }
);

transactionSchema.index(
  { accountId: 1, createdAt: -1 },
  {
    name: 'idx_account_created_desc'
  }
);

transactionSchema.index(
  { accountId: 1, type: 1, createdAt: -1 },
  {
    name: 'idx_account_type_created_desc'
  }
);

transactionSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function () {
  throw new Error('Transactions are immutable and cannot be updated');
});

transactionSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function () {
  throw new Error('Transactions are immutable and cannot be deleted');
});

export const Transaction = mongoose.model<TransactionDocument, Model<TransactionDocument>>(
  'Transaction',
  transactionSchema
);

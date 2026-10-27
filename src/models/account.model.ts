import mongoose, { Schema, type Model } from 'mongoose';
import type { AccountPublic } from '../types/transaction.js';

export interface AccountDocument extends mongoose.Document {
  name: string;
  balanceMinorUnits: number;
  createdAt: Date;
  updatedAt: Date;

  toPublic(): AccountPublic;
}

const accountSchema = new Schema<AccountDocument>(
  {
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      minlength: [1, 'Account name cannot be empty'],
      maxlength: [120, 'Account name cannot exceed 120 characters']
    },
    balanceMinorUnits: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Account balance cannot be negative']
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: false,
      transform(_doc, ret) {
        const serialized = ret as Record<string, unknown>;

        serialized.id = serialized._id?.toString();
        delete serialized._id;
        delete serialized.balanceMinorUnits;

        return serialized;
      }
    }
  }
);

accountSchema.methods.toPublic = function (): AccountPublic {
  return {
    id: this._id.toString(),
    name: this.name,
    balance: this.balanceMinorUnits / 100,
    createdAt: this.createdAt.toISOString()
  };
};

export const Account = mongoose.model<AccountDocument, Model<AccountDocument>>(
  'Account',
  accountSchema
);

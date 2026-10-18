import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ['esewa', 'khalti', 'fonepay', 'cod', 'bank_transfer'],
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    gatewayTransactionId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NPR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    bankTransferDetails: {
      bankName: { type: String, default: null },
      accountName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      referenceNumber: { type: String, default: null },
      receiptUrl: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ order: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);

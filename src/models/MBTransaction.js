import mongoose from "mongoose";

const mbTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "credit",
        "debit",
        "borrow",
        "repayment",
        "reserve",
        "release",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for faster user transaction history
mbTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("MBTransaction", mbTransactionSchema);
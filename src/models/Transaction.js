import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "credit",
        "debit",
        "borrow",
        "repayment",
        "reserve",
        "release",
      ],
    },

    currency: {
      type: String,
      required: true,
      enum: ["NGN", "MB"],
    },

    amount: {
      type: Number,
      required: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,   // 🔒 Enforces idempotency at DB level
      index: true,
    },

    from: {
      type: String,
      default: null,
    },

    to: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
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
transactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Transaction", transactionSchema);
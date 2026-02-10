import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Identity
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Wallet (₦)
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Data balances (MB)
    usableMB: {
      type: Number,
      default: 0,
      min: 0,
    },

    reservedMB: {
      type: Number,
      default: 0,
      min: 0,
    },

    borrowedMB: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Earn logic
    earnedToday: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastEarnedAt: {
      type: Date,
      default: null,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;

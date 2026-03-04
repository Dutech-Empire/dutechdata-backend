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
    email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  index: true,
},

    // Wallet (₦)
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    mbBalance: {
  type: Number,
  default: 0
},

    // Data balances (MB)
    usableMB:{
      type: Number,
      default: 0,
      min: 0,
    },
    isFrozen: {
  type: Boolean,
  default: false
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

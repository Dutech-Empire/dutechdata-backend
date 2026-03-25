import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =========================
    // 🧍 Identity
    // =========================
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

    // =========================
    // 💰 Wallet (₦)
    // =========================
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // 📶 Data Balances (MB)
    // =========================
    mbBalance: {
      type: Number,
      default: 0,
    },

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

    // =========================
    // 🚫 Account State
    // =========================
    isFrozen: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================
    // 🎯 EARN SYSTEM (HARDENED)
    // =========================
    earnedToday: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastEarnedAt: {
      type: Date,
      default: null,
    },

    lastEarnReset: {
      type: Date,
      default: Date.now,
    },

    earnAttempts: {
      type: Number,
      default: 0,
    },
    // =========================
// 🧠 FRAUD SYSTEM
// =========================
riskScore: {
  type: Number,
  default: 0,
},

isBlocked: {
  type: Boolean,
  default: false,
},

    // =========================
    // 🛡️ SECURITY TRACKING (NEW)
    // =========================
    lastIP: {
      type: String,
      default: null,
    },

    lastUserAgent: {
      type: String,
      default: null,
    },

    knownIPs: {
      type: [String],
      default: [],
    },

    knownDevices: {
      type: [String],
      default: [],
    },
  },
  
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
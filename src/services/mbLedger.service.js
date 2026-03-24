import User from "../models/User.js";
import MBTransaction from "../models/MBTransaction.js";
import crypto from "crypto";

export const executeMBTransaction = async ({
  userId,
  type,
  amount,
  reference,
  metadata = {},
}) => {
  // =========================
  // 🛑 1. VALIDATION (CRITICAL)
  // =========================
  if (!userId || !type || !amount) {
    throw new Error("Invalid transaction payload");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const allowedTypes = [
    "credit",
    "debit",
    "borrow",
    "repayment",
    "reserve",
    "release",
  ];

  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid transaction type");
  }

  const session = await User.startSession();

  try {
    session.startTransaction();

    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    const balanceBefore = user.usableMB || 0;
    let balanceAfter = balanceBefore;

    // =========================
    // 💰 CREDIT MB
    // =========================
    if (type === "credit") {
      let remaining = amount;

      // Repay borrowed first
      if (user.borrowedMB > 0) {
        const repayment = Math.min(user.borrowedMB, remaining);

        user.borrowedMB -= repayment;
        remaining -= repayment;
      }

      balanceAfter += remaining;
    }

    // =========================
    // 💸 DEBIT MB
    // =========================
    if (type === "debit") {
      if (balanceBefore < amount) {
        throw new Error("Insufficient MB");
      }

      balanceAfter -= amount;
    }

    // =========================
    // 🆘 BORROW MB
    // =========================
    if (type === "borrow") {
      if (balanceBefore > 0) {
        throw new Error("Borrow allowed only when MB is zero");
      }

      user.borrowedMB += amount;
      balanceAfter += amount;
    }

    // =========================
    // 🔁 REPAYMENT
    // =========================
    if (type === "repayment") {
      if (user.borrowedMB <= 0) {
        throw new Error("No borrowed MB to repay");
      }

      const repayment = Math.min(user.borrowedMB, amount);
      user.borrowedMB -= repayment;
    }

    // =========================
    // 🔒 RESERVE
    // =========================
    if (type === "reserve") {
      if (balanceBefore < amount) {
        throw new Error("Not enough MB to reserve");
      }

      user.reservedMB += amount;
      balanceAfter -= amount;
    }

    // =========================
    // 🔓 RELEASE
    // =========================
    if (type === "release") {
      if (user.reservedMB < amount) {
        throw new Error("Not enough reserved MB");
      }

      user.reservedMB -= amount;
      balanceAfter += amount;
    }

    // =========================
    // 🧾 UPDATE USER
    // =========================
    user.usableMB = balanceAfter;

    await user.save({ session });

    // =========================
    // 🧾 RECORD TRANSACTION
    // =========================
    await MBTransaction.create(
      [
        {
          userId,
          type,
          amount,
          reference: reference || "MB_" + crypto.randomUUID(),
          balanceBefore,
          balanceAfter,
          metadata,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      balanceBefore,
      balanceAfter,
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
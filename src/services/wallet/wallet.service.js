import mongoose from "mongoose";
import User from "../../models/User.js";
import Transaction from "../../models/Transaction.js";

export const executeTransaction = async ({
  userId,
  type,
  amount,
  currency,
  reference,
  from = null,
  to = null,
  metadata = {},
}) => {

  if (!userId || !type || !amount || !currency || !reference) {
    throw new Error("Invalid transaction payload");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Idempotency check
    const existing = await Transaction.findOne({ reference }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return existing;
    }

    // 2️⃣ Fetch user
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    // 3️⃣ Handle logic by currency
    if (currency === "NGN") {

      if (type === "credit") {
        user.walletBalance += amount;
      }

      if (type === "debit") {
        if (user.walletBalance < amount) {
          throw new Error("Insufficient wallet balance");
        }
        user.walletBalance -= amount;
      }

    }

    if (currency === "MB") {

      if (type === "credit") {
        user.usableMB += amount;
      }

      if (type === "debit") {
        if (user.usableMB < amount) {
          throw new Error("Insufficient MB balance");
        }
        user.usableMB -= amount;
      }

      if (type === "borrow") {
        if (user.usableMB > 0) {
          throw new Error("Borrow only allowed at 0MB");
        }
        if (user.borrowedMB > 0) {
          throw new Error("Outstanding borrowed MB exists");
        }

        user.usableMB += amount;
        user.borrowedMB += amount;
      }

      if (type === "repayment") {
        if (user.borrowedMB <= 0) {
          throw new Error("No active borrow");
        }
        if (user.usableMB < user.borrowedMB) {
          throw new Error("Insufficient MB for repayment");
        }

        user.usableMB -= user.borrowedMB;
        user.borrowedMB = 0;
      }

      if (type === "reserve") {
        if (user.usableMB < amount) {
          throw new Error("Insufficient usable MB");
        }

        user.usableMB -= amount;
        user.reservedMB += amount;
      }

      if (type === "release") {
        if (user.reservedMB < amount) {
          throw new Error("Insufficient reserved MB");
        }

        user.reservedMB -= amount;
        user.usableMB += amount;
      }
    }

    // 4️⃣ Save user changes
    await user.save({ session });

    // 5️⃣ Create ledger record
    const transaction = await Transaction.create([{
      userId,
      type,
      currency,
      amount,
      reference,
      from,
      to,
      status: "completed",
      metadata
    }], { session });

    // 6️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return transaction[0];

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

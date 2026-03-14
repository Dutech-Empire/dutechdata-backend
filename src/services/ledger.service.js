import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const executeTransaction = async ({
  userId,
  type,
  amount,
  currency,
  reference,
  from = null,
  to = null,
  metadata = {},
  session = null,
}) => {

  if (!userId || !type || !amount || !currency || !reference) {
    throw new Error("Invalid transaction payload");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  let internalSession = session;

  if (!internalSession) {
    internalSession = await mongoose.startSession();
    internalSession.startTransaction();
  }

  try {

    const user = await User.findById(userId).session(internalSession);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isFrozen) {
      throw new Error("Account is frozen. Transactions are disabled.");
    }

    let balanceBefore;
    let balanceAfter;

    // ===============================
    // 💰 NGN WALLET LOGIC
    // ===============================
    if (currency === "NGN") {

      if (type === "debit") {

        const updatedUser = await User.findOneAndUpdate(
          {
            _id: userId,
            walletBalance: { $gte: amount },
          },
          {
            $inc: { walletBalance: -amount },
          },
          {
            new: true,
            session: internalSession,
          }
        );

        if (!updatedUser) {
          throw new Error("Insufficient wallet balance");
        }

        balanceAfter = updatedUser.walletBalance;
        balanceBefore = balanceAfter + amount;
      }

      if (type === "credit") {

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $inc: { walletBalance: amount } },
          { new: true, session: internalSession }
        );

        balanceAfter = updatedUser.walletBalance;
        balanceBefore = balanceAfter - amount;
      }
    }

    // ===============================
    // 📶 MB WALLET LOGIC
    // ===============================
    if (currency === "MB") {

      if (type === "debit") {

        const updatedUser = await User.findOneAndUpdate(
          {
            _id: userId,
            usableMB: { $gte: amount },
          },
          {
            $inc: { usableMB: -amount },
          },
          {
            new: true,
            session: internalSession,
          }
        );

        if (!updatedUser) {
          throw new Error("Insufficient MB balance");
        }

        balanceAfter = updatedUser.usableMB;
        balanceBefore = balanceAfter + amount;
      }

      if (type === "credit") {

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $inc: { usableMB: amount } },
          { new: true, session: internalSession }
        );

        balanceAfter = updatedUser.usableMB;
        balanceBefore = balanceAfter - amount;
      }
    }

    // ===============================
    // 📘 LEDGER RECORD
    // ===============================
    const transaction = await Transaction.create(
      [
        {
          userId,
          type,
          currency,
          amount,
          reference,
          from,
          to,
          status: "completed",
          balanceBefore,
          balanceAfter,
          metadata,
        },
      ],
      { session: internalSession }
    );

    if (!session) {
      await internalSession.commitTransaction();
      internalSession.endSession();
    }

    return transaction[0];

  } catch (error) {

    if (!session) {
      await internalSession.abortTransaction();
      internalSession.endSession();
    }

    throw error;
  }
};
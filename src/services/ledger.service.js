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
}) => {
  if (!userId || !type || !amount || !currency || !reference) {
    throw new Error("Invalid transaction payload");
  }

  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔹 FETCH USER INSIDE SESSION
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    // 🔒 FREEZE GUARD — CORRECT LOCATION
    if (user.isFrozen) {
      throw new Error("Account is frozen. Transactions are disabled.");
    }

    // 🔹 Continue with your existing mutation logic below...



    let balanceBefore;
    let balanceAfter;

    // ===============================
    // 💰 NGN LOGIC (CONCURRENCY SAFE)
    // ===============================
    if (currency === "NGN") {

      if (type === "debit") {

        const user = await User.findOneAndUpdate(
          {
            _id: userId,
            walletBalance: { $gte: amount },
          },
          {
            $inc: { walletBalance: -amount },
          },
          {
            new: true,
            session,
          }
        );

        if (!user) {
          throw new Error("Insufficient wallet balance");
        }

        balanceAfter = user.walletBalance;
        balanceBefore = balanceAfter + amount;
      }

      if (type === "credit") {

        const user = await User.findByIdAndUpdate(
          userId,
          { $inc: { walletBalance: amount } },
          { new: true, session }
        );

        if (!user) {
          throw new Error("User not found");
        }

        balanceAfter = user.walletBalance;
        balanceBefore = balanceAfter - amount;
      }
    }

    // ===============================
    // 📶 MB LOGIC (CONCURRENCY SAFE)
    // ===============================
    if (currency === "MB") {

      if (type === "debit") {

        const user = await User.findOneAndUpdate(
          {
            _id: userId,
            usableMB: { $gte: amount },
          },
          {
            $inc: { usableMB: -amount },
          },
          {
            new: true,
            session,
          }
        );

        if (!user) {
          throw new Error("Insufficient MB balance");
        }

        balanceAfter = user.usableMB;
        balanceBefore = balanceAfter + amount;
      }

      if (type === "credit") {

        const user = await User.findByIdAndUpdate(
          userId,
          { $inc: { usableMB: amount } },
          { new: true, session }
        );

        if (!user) {
          throw new Error("User not found");
        }

        balanceAfter = user.usableMB;
        balanceBefore = balanceAfter - amount;
      }

    // ===============================
// 📶 MB ADVANCED OPERATIONS (ATOMIC SAFE)
// ===============================

if (currency === "MB") {

  // 🔹 BORROW
  if (type === "borrow") {

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        usableMB: 0,
        borrowedMB: 0,
      },
      {
        $inc: {
          usableMB: amount,
          borrowedMB: amount,
        },
      },
      { new: true, session }
    );

    if (!user) {
      throw new Error("Borrow conditions not met");
    }

    balanceBefore = 0;
    balanceAfter = user.usableMB;
  }

  // 🔹 REPAYMENT
  if (type === "repayment") {

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        borrowedMB: { $gt: 0 },
        usableMB: { $gte: amount },
      },
      {
        $inc: {
          usableMB: -amount,
          borrowedMB: -amount,
        },
      },
      { new: true, session }
    );

    if (!user) {
      throw new Error("Repayment conditions not met");
    }

    balanceAfter = user.usableMB;
    balanceBefore = balanceAfter + amount;
  }

  // 🔹 RESERVE
  if (type === "reserve") {

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        usableMB: { $gte: amount },
      },
      {
        $inc: {
          usableMB: -amount,
          reservedMB: amount,
        },
      },
      { new: true, session }
    );

    if (!user) {
      throw new Error("Insufficient usable MB");
    }

    balanceAfter = user.usableMB;
    balanceBefore = balanceAfter + amount;
  }

  // 🔹 RELEASE
  if (type === "release") {

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        reservedMB: { $gte: amount },
      },
      {
        $inc: {
          reservedMB: -amount,
          usableMB: amount,
        },
      },
      { new: true, session }
    );

    if (!user) {
      throw new Error("Insufficient reserved MB");
    }

    balanceAfter = user.usableMB;
    balanceBefore = balanceAfter - amount;
  }
}  
      
    
    }

    // 2️⃣ CREATE LEDGER ENTRY
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
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return transaction[0];

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
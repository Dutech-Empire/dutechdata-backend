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
  const session = await User.startSession();

  try {
    session.startTransaction();

    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    const balanceBefore = user.usableMB || 0;
    let balanceAfter = balanceBefore;

    // CREDIT MB
    if (type === "credit") {

  let remaining = amount;

  // Repay borrowed MB first
  if (user.borrowedMB > 0) {

    const repayment = Math.min(user.borrowedMB, remaining);

    user.borrowedMB -= repayment;
    remaining -= repayment;

  }

  // Remaining MB becomes usable
  balanceAfter += remaining;
}
    // DEBIT MB
    if (type === "debit") {
      if (balanceBefore < amount) {
        throw new Error("Insufficient MB");
      }
      balanceAfter -= amount;
    }

    // BORROW MB
    if (type === "borrow") {
      if (balanceBefore > 0) {
        throw new Error("Borrow allowed only when MB is zero");
      }

      user.borrowedMB += amount;
      balanceAfter += amount;
    }

    // REPAY MB
    if (type === "repayment") {
      if (user.borrowedMB <= 0) {
        throw new Error("No borrowed MB to repay");
      }

      user.borrowedMB -= amount;
    }

    // RESERVE MB
    if (type === "reserve") {
      if (balanceBefore < amount) {
        throw new Error("Not enough MB to reserve");
      }

      user.reservedMB += amount;
      balanceAfter -= amount;
    }

    // RELEASE MB
    if (type === "release") {
      if (user.reservedMB < amount) {
        throw new Error("Not enough reserved MB");
      }

      user.reservedMB -= amount;
      balanceAfter += amount;
    }

    user.usableMB = balanceAfter;

    await user.save({ session });

    await MBTransaction.create(
      [
        {
          userId,
          type,
          amount,
          reference,
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
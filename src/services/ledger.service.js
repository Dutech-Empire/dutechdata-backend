import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

/**
 * Create a transaction and safely apply it
 */
export const applyTransaction = async ({
  uid,
  type,
  source,
  amount,
  currency,
  description = "",
}) => {
  if (amount <= 0) {
    throw new Error("Transaction amount must be positive");
  }

  // Create transaction (pending)
  const tx = await Transaction.create({
    uid,
    type,
    source,
    amount,
    currency,
    description,
    status: "pending",
  });

  const user = await User.findById(uid);
  if (!user) {
    tx.status = "failed";
    await tx.save();
    throw new Error("User not found");
  }

  try {
    // ₦ Wallet logic
    if (currency === "NGN") {
      if (type === "debit") {
        if (user.walletBalance < amount) {
          throw new Error("Insufficient wallet balance");
        }
        user.walletBalance -= amount;
      } else {
        user.walletBalance += amount;
      }
    }

    // MB logic
    if (currency === "MB") {
      if (type === "debit") {
        if (user.usableMB < amount) {
          throw new Error("Insufficient data balance");
        }
        user.usableMB -= amount;
      } else {
        user.usableMB += amount;
      }
    }

    await user.save();

    tx.status = "success";
    await tx.save();

    return tx;
  } catch (error) {
    tx.status = "failed";
    await tx.save();
    throw error;
  }
};

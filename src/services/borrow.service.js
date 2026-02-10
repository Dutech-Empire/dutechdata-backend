import User from "../models/User.js";
import { applyTransaction } from "./ledger.service.js";
import { BORROW_RULES } from "../utils/borrowRules.js";

export const borrowMB = async (uid) => {
  const user = await User.findById(uid);
  if (!user) {
    throw new Error("User not found");
  }

  // Rule 1: Only allow borrow at 0 usable MB
  if (user.usableMB > 0) {
    throw new Error("Borrow only allowed at 0MB");
  }

  // Rule 2: Only one borrow at a time
  if (user.borrowedMB > 0) {
    throw new Error("Outstanding borrowed MB exists");
  }

  const borrowAmount = BORROW_RULES.BORROW_MB;

  // Ledger credit (MB)
  await applyTransaction({
    uid,
    type: "credit",
    source: "borrow",
    amount: borrowAmount,
    currency: "MB",
    description: "Emergency borrow MB",
  });

  // Mark debt
  user.borrowedMB = borrowAmount;
  await user.save();

  return {
    borrowedMB: borrowAmount,
    message: "Emergency data borrowed successfully",
  };
};

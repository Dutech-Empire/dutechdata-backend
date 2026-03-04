import { executeTransaction } from "./wallet/wallet.service.js";
import { BORROW_RULES } from "../utils/borrowRules.js";

export const borrowMB = async (userId) => {

  const borrowAmount = BORROW_RULES.BORROW_MB;

  const transaction = await executeTransaction({
    userId,
    type: "borrow",
    amount: borrowAmount,
    currency: "MB",
    reference: `BORROW_${Date.now()}_${userId}`,
    to: "usable",
    metadata: {
      reason: "Emergency borrow MB"
    }
  });

  return {
    message: "Emergency data borrowed successfully",
    borrowedAmount: borrowAmount,
    transactionId: transaction._id
  };
};

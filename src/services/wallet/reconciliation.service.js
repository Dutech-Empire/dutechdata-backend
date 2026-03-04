import Transaction from "../../models/Transaction.js";
import User from "../../models/User.js";

export const reconcileWallet = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // ============================
  // 🔹 NGN WALLET RECONCILIATION
  // ============================

  const ngnAggregation = await Transaction.aggregate([
    {
      $match: {
        userId: user._id,
        status: "completed",
        currency: "NGN",
      },
    },
    {
      $group: {
        _id: null,
        totalCredits: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
        totalDebits: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const ngnCredits = ngnAggregation[0]?.totalCredits || 0;
  const ngnDebits = ngnAggregation[0]?.totalDebits || 0;

  const computedNGNBalance = ngnCredits - ngnDebits;

  const ngnResult = {
    actualBalance: user.walletBalance,
    computedBalance: computedNGNBalance,
    isBalanced: user.walletBalance === computedNGNBalance,
  };

  // ============================
  // 🔹 MB WALLET RECONCILIATION
  // ============================

  const mbAggregation = await Transaction.aggregate([
    {
      $match: {
        userId: user._id,
        status: "completed",
        currency: "MB",
      },
    },
    {
      $group: {
        _id: null,
        totalCredits: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
        totalDebits: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },
        totalBorrow: {
          $sum: {
            $cond: [{ $eq: ["$type", "borrow"] }, "$amount", 0],
          },
        },
        totalRepayment: {
          $sum: {
            $cond: [{ $eq: ["$type", "repayment"] }, "$amount", 0],
          },
        },
        totalReserve: {
          $sum: {
            $cond: [{ $eq: ["$type", "reserve"] }, "$amount", 0],
          },
        },
        totalRelease: {
          $sum: {
            $cond: [{ $eq: ["$type", "release"] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const mbCredits = mbAggregation[0]?.totalCredits || 0;
  const mbDebits = mbAggregation[0]?.totalDebits || 0;
  const mbBorrow = mbAggregation[0]?.totalBorrow || 0;
  const mbRepayment = mbAggregation[0]?.totalRepayment || 0;
  const mbReserve = mbAggregation[0]?.totalReserve || 0;
  const mbRelease = mbAggregation[0]?.totalRelease || 0;

  /**
   * MB Balance Logic:
   *
   * Credits increase balance
   * Debits decrease balance
   * Borrow increases balance
   * Repayment decreases balance
   * Reserve decreases available balance
   * Release increases available balance
   */

  const computedMBBalance =
    mbCredits -
    mbDebits +
    mbBorrow -
    mbRepayment -
    mbReserve +
    mbRelease;

  const mbResult = {
    actualBalance: user.mbBalance,
    computedBalance: computedMBBalance,
    isBalanced: user.mbBalance === computedMBBalance,
  };

  // ============================
  // 🔹 FINAL RESULT
  // ============================

  return {
    ngn: ngnResult,
    mb: mbResult,
    isBalanced: ngnResult.isBalanced && mbResult.isBalanced,
  };
};
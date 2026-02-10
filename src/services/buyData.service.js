import User from "../models/User.js";
import { DATA_BUNDLES } from "../utils/dataBundles.js";
import { applyTransaction } from "./ledger.service.js";

export const buyData = async (uid, bundleId) => {
  const bundle = DATA_BUNDLES[bundleId];

  if (!bundle) {
    throw new Error("Invalid data bundle");
  }

  const user = await User.findById(uid);
  if (!user) {
    throw new Error("User not found");
  }

  const { mb, price } = bundle;

  // 1️⃣ Debit wallet (₦)
  await applyTransaction({
    uid,
    type: "debit",
    source: "buy",
    amount: price,
    currency: "NGN",
    description: `Purchased ${mb}MB data`,
  });

  // 2️⃣ Repay borrowed MB first (if any)
  let remainingMB = mb;

  if (user.borrowedMB > 0) {
    const repayAmount = Math.min(user.borrowedMB, remainingMB);

    // Reduce borrowed MB
    user.borrowedMB -= repayAmount;
    remainingMB -= repayAmount;

    await user.save();

    // Ledger record for repayment (MB)
    await applyTransaction({
      uid,
      type: "debit",
      source: "repayment",
      amount: repayAmount,
      currency: "MB",
      description: "Auto repayment of borrowed MB",
    });
  }

  // 3️⃣ Credit remaining MB as usable
  if (remainingMB > 0) {
    await applyTransaction({
      uid,
      type: "credit",
      source: "buy",
      amount: remainingMB,
      currency: "MB",
      description: `Usable data credited after repayment`,
    });
  }

  return {
    purchasedMB: mb,
    repaidBorrowedMB: mb - remainingMB,
    usableMBAdded: remainingMB,
  };
};

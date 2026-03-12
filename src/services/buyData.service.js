import User from "../models/User.js";
import { DATA_BUNDLES } from "../utils/dataBundles.js";
import { executeTransaction } from "../services/ledger.service.js";
import { generateReference } from "../utils/generateReference.js";

export const buyData = async (uid, bundleId) => {
  const bundle = DATA_BUNDLES[bundleId];
  const reference = generateReference("DATA");

  if (!bundle) {
    throw new Error("Invalid data bundle");
  }

  const user = await User.findById(uid);
  if (!user) {
    throw new Error("User not found");
  }

  const { mb, price } = bundle;

  // 1️⃣ Debit wallet (₦)
 await executeTransaction({
  userId: uid,
  type: "debit",
  amount: price,
  currency: "NGN",
  reference,
  metadata: {
    action: "buy-data",
    bundleId,
  },
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
    await executeTransaction({
      uid,
      type: "debit",
      source: "repayment",
      amount: repayAmount,
      currency: "MB",
      description: "Auto repayment of borrowed MB",
    });
  }

  // 3️⃣ Credit remaining MB as usable
  await executeTransaction({
  userId: uid,
  type: "credit",
  amount: remainingMB,
  currency: "MB",
  reference,
  metadata: {
    action: "buy-data",
    bundleId,
  },
});

  return {
    purchasedMB: mb,
    repaidBorrowedMB: mb - remainingMB,
    usableMBAdded: remainingMB,
  };
};

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

  // 2️⃣ Repay borrowed MB internally
  let remainingMB = mb;
  let repaidBorrowedMB = 0;

  if (user.borrowedMB > 0) {

    const repayAmount = Math.min(user.borrowedMB, remainingMB);

    user.borrowedMB -= repayAmount;
    remainingMB -= repayAmount;

    repaidBorrowedMB = repayAmount;

    await user.save();
  }

  // 3️⃣ Credit remaining MB as usable
  if (remainingMB > 0) {

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

  }

  return {
    purchasedMB: mb,
    repaidBorrowedMB,
    usableMBAdded: remainingMB,
  };
};
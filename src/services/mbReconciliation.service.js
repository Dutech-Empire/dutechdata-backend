import User from "../models/User.js";
import MBTransaction from "../models/MBTransaction.js";

export const runMBReconciliation = async () => {

  console.log("🔍 MB reconciliation started...");

  const users = await User.find({});

  for (const user of users) {

    const transactions = await MBTransaction.find({
      userId: user._id
    });

    let computedBalance = 0;

    for (const tx of transactions) {

      if (tx.type === "credit" || tx.type === "borrow" || tx.type === "release") {
        computedBalance += tx.amount;
      }

      if (tx.type === "debit" || tx.type === "reserve" || tx.type === "repayment") {
        computedBalance -= tx.amount;
      }
    }

    const actualBalance = user.usableMB;

    if (computedBalance !== actualBalance) {

      console.log("🚨 MB RECONCILIATION MISMATCH");

      console.log({
        userId: user._id,
        computedBalance,
        actualBalance
      });

    } else {

      console.log(`✅ MB wallet OK for user ${user._id}`);

    }

  }

  console.log("✅ MB reconciliation completed");

};
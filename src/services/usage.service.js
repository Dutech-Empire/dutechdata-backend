import Transaction from "../models/Transaction.js";

export const getTodayUsage = async (userId) => {

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const transactions = await Transaction.find({
    userId,
    currency: "MB",
    type: "debit",
    createdAt: { $gte: startOfToday }
  });

  let totalUsed = 0;

  for (const tx of transactions) {
    totalUsed += tx.amount;
  }

  return totalUsed;
};
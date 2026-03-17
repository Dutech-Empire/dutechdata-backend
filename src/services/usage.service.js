import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const getUsageStats = async (userId) => {

  // 🕒 Start of today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 🕒 Start of 7 days ago
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  // 📊 Get today's usage
  const todayTx = await Transaction.find({
    userId,
    currency: "MB",
    type: "debit",
    createdAt: { $gte: startOfToday }
  });

  let todayUsage = 0;
  for (const tx of todayTx) {
    todayUsage += tx.amount;
  }

  // 📊 Get weekly usage
  const weekTx = await Transaction.find({
    userId,
    currency: "MB",
    type: "debit",
    createdAt: { $gte: startOfWeek }
  });

  let weeklyUsage = 0;
  for (const tx of weekTx) {
    weeklyUsage += tx.amount;
  }

  // 📊 Average daily usage
  const averageDailyUsage = weeklyUsage > 0
    ? Math.round(weeklyUsage / 7)
    : 0;

  // 📊 Get user MB balance
  const user = await User.findById(userId);

  let estimatedDaysRemaining = 0;

  if (averageDailyUsage > 0) {
    estimatedDaysRemaining = Math.floor(
      user.usableMB / averageDailyUsage
    );
  }

  return {
    todayUsage,
    weeklyUsage,
    averageDailyUsage,
    estimatedDaysRemaining
  };
};
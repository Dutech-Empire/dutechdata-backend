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
  const insight = generateInsight({
  todayUsage,
  averageDailyUsage,
  estimatedDaysRemaining
});
return {
  todayUsage,
  weeklyUsage,
  averageDailyUsage,
  estimatedDaysRemaining,
  insight
};
};
const generateInsight = ({
  todayUsage,
  averageDailyUsage,
  estimatedDaysRemaining
}) => {

  if (todayUsage === 0) {
    return "You haven’t used any data today.";
  }

  if (averageDailyUsage < 50) {
    return "You are using data lightly. Your data will last longer.";
  }

  if (averageDailyUsage >= 50 && averageDailyUsage <= 150) {
    return "Your data usage is moderate and well balanced.";
  }

  if (averageDailyUsage > 150) {
    return "You are using data heavily. Consider reserving data or monitoring usage.";
  }

  if (estimatedDaysRemaining > 5) {
    return "Your data should last several days comfortably.";
  }

  if (estimatedDaysRemaining <= 2) {
    return "Your data may run out soon. Consider topping up.";
  }

  return "Your data usage is being tracked successfully.";
};
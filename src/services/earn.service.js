import User from "../models/User.js";
import { applyTransaction } from "./ledger.service.js";
import { EARN_RULES } from "../utils/earnRules.js";

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export const earnData = async (uid) => {
  const user = await User.findById(uid);
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  // 🔄 Reset daily earn if new day
  if (user.lastEarnedAt && !isSameDay(user.lastEarnedAt, now)) {
    user.earnedToday = 0;
  }

  if (user.earnedToday >= EARN_RULES.DAILY_CAP_MB) {
    throw new Error("Daily earn limit reached");
  }

  const earnAmount = Math.min(
    EARN_RULES.EARN_MB,
    EARN_RULES.DAILY_CAP_MB - user.earnedToday
  );

  // Ledger credit (MB)
  await applyTransaction({
    uid,
    type: "credit",
    source: "earn",
    amount: earnAmount,
    currency: "MB",
    description: "Daily data earn",
  });

  // Update earn tracking
  user.earnedToday += earnAmount;
  user.lastEarnedAt = now;
  await user.save();

  return {
    earnedMB: earnAmount,
    earnedToday: user.earnedToday,
    dailyCap: EARN_RULES.DAILY_CAP_MB,
  };
};

import User from "../models/User.js";
import { executeMBTransaction } from "../services/mbLedger.service.js";
import { EARN_RULES } from "../utils/earnRules.js";
import { trackUserAccess } from "../utils/securityTracker.js";
import { evaluateUserRisk } from "../services/fraud.service.js";

export const earnData = async (uid, req) => {
  const user = await User.findById(uid);
  if (!user) {
    throw new Error("User not found");
  }

  // =========================
  // 🛡️ TRACK USER ACCESS
  // =========================
  trackUserAccess(req, user);

  const now = new Date();

  // =========================
  // 🔄 DAILY RESET
  // =========================
  const hoursSinceReset =
    (now - new Date(user.lastEarnReset || now)) / (1000 * 60 * 60);

  if (hoursSinceReset >= 24) {
    user.earnedToday = 0;
    user.lastEarnReset = now;
    user.earnAttempts = 0;
  }

  // =========================
  // 🚨 ALWAYS INCREMENT ATTEMPTS (FIX 🔥)
  // =========================
  user.earnAttempts = (user.earnAttempts || 0) + 1;

  // =========================
  // 🧠 FRAUD CHECK (AFTER ATTEMPTS)
  // =========================
  const risk = evaluateUserRisk(user);

  if (user.isBlocked) {
    await user.save();
    throw new Error("Account temporarily restricted due to suspicious activity");
  }

  // =========================
  // ⏳ COOLDOWN CHECK
  // =========================
  if (user.lastEarnedAt) {
    const secondsSinceLastEarn =
      (now - new Date(user.lastEarnedAt)) / 1000;

    if (secondsSinceLastEarn < EARN_RULES.COOLDOWN_SECONDS) {
      await user.save();
      const wait = Math.ceil(
        EARN_RULES.COOLDOWN_SECONDS - secondsSinceLastEarn
      );
      throw new Error(`Wait ${wait}s before earning again`);
    }
  }

  // =========================
  // 🚫 DAILY CAP CHECK
  // =========================
  if (user.earnedToday >= EARN_RULES.DAILY_CAP_MB) {
    await user.save();
    throw new Error("Daily earn limit reached");
  }

  // =========================
  // 🎯 CALCULATE EARN
  // =========================
  const earnAmount = Math.min(
    EARN_RULES.EARN_MB,
    EARN_RULES.DAILY_CAP_MB - user.earnedToday
  );

  // =========================
  // 💰 LEDGER
  // =========================
  await executeMBTransaction({
    userId: user._id,
    type: "credit",
    amount: earnAmount,
    reference: "MBEARN_" + Date.now(),
    metadata: { source: "earn" }
  });

  // =========================
  // 📊 UPDATE USER
  // =========================
  user.earnedToday += earnAmount;
  user.lastEarnedAt = now;

  await user.save();

  return {
    earnedMB: earnAmount,
    earnedToday: user.earnedToday,
    remainingMB:
      EARN_RULES.DAILY_CAP_MB - user.earnedToday,
    dailyCap: EARN_RULES.DAILY_CAP_MB,
  };
};
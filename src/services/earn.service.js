import User from "../models/User.js";
import { executeMBTransaction } from "../services/mbLedger.service.js";
import { EARN_RULES } from "../utils/earnRules.js";
import { trackUserAccess } from "../utils/securityTracker.js";

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
  // 🔄 1. DAILY RESET (FIRST)
  // =========================
  const hoursSinceReset =
    (now - new Date(user.lastEarnReset || now)) / (1000 * 60 * 60);

  if (hoursSinceReset >= 24) {
    user.earnedToday = 0;
    user.lastEarnReset = now;
    user.earnAttempts = 0;
  }

  // =========================
  // ⏳ 2. COOLDOWN CHECK
  // =========================
  if (user.lastEarnedAt) {
    const secondsSinceLastEarn =
      (now - new Date(user.lastEarnedAt)) / 1000;

    if (secondsSinceLastEarn < EARN_RULES.COOLDOWN_SECONDS) {
      const wait = Math.ceil(
        EARN_RULES.COOLDOWN_SECONDS - secondsSinceLastEarn
      );
      throw new Error(`Wait ${wait}s before earning again`);
    }
  }

  // =========================
  // 🚫 3. DAILY CAP CHECK
  // =========================
  if (user.earnedToday >= EARN_RULES.DAILY_CAP_MB) {
    throw new Error("Daily earn limit reached");
  }

  // =========================
  // 🚨 4. ABUSE DETECTION
  // =========================
  user.earnAttempts = (user.earnAttempts || 0) + 1;

  if (user.earnAttempts > EARN_RULES.MAX_ATTEMPTS_PER_DAY) {
    throw new Error("Suspicious activity detected. Try again later.");
  }

  // =========================
  // 🎯 5. CALCULATE EARN
  // =========================
  const earnAmount = Math.min(
    EARN_RULES.EARN_MB,
    EARN_RULES.DAILY_CAP_MB - user.earnedToday
  );

  // =========================
  // 💰 6. MB LEDGER (FIXED)
  // =========================
  await executeMBTransaction({
    userId: user._id, // ✅ FIXED
    type: "credit",
    amount: earnAmount,
    reference: "MBEARN_" + Date.now(),
    metadata: {
      source: "earn"
    }
  });

  // =========================
  // 📊 7. UPDATE USER
  // =========================
  user.earnedToday += earnAmount;
  user.lastEarnedAt = now;

  await user.save();

  // =========================
  // 📦 8. RESPONSE
  // =========================
  return {
    earnedMB: earnAmount,
    earnedToday: user.earnedToday,
    remainingMB:
      EARN_RULES.DAILY_CAP_MB - user.earnedToday,
    dailyCap: EARN_RULES.DAILY_CAP_MB,
  };
};
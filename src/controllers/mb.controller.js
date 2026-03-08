import crypto from "crypto";
import User from "../models/User.js";
import { executeMBTransaction } from "../services/mbLedger.service.js";

export const earnMBController = async (req, res) => {
  try {

    const user = req.user;

    const DAILY_LIMIT = 30; // 30MB per day
    const REWARD = 10; // reward per task

    const today = new Date();
    today.setHours(0,0,0,0);

    // Reset counter if new day
    if (!user.lastEarnedAt || user.lastEarnedAt < today) {
      user.earnedToday = 0;
    }

    if (user.earnedToday + REWARD > DAILY_LIMIT) {
      return res.status(400).json({
        message: "Daily earn limit reached"
      });
    }

    const reference = "MBEARN_" + crypto.randomUUID();

    const result = await executeMBTransaction({
      userId: user._id,
      type: "credit",
      amount: REWARD,
      reference,
      metadata: {
        source: "earn-task"
      }
    });

    user.earnedToday += REWARD;
    user.lastEarnedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "MB earned successfully",
      earned: REWARD,
      balanceBefore: result.balanceBefore,
      balanceAfter: result.balanceAfter
    });

  } catch (error) {
    console.error("Earn MB error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
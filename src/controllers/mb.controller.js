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
export const borrowMBController = async (req, res) => {
  try {

    const user = req.user;
    const BORROW_AMOUNT = 50;

    // Borrow only allowed if usableMB is zero
    if (user.usableMB > 0) {
      return res.status(400).json({
        message: "Borrow allowed only when usable MB is zero"
      });
    }

    // Prevent multiple borrow
    if (user.borrowedMB > 0) {
      return res.status(400).json({
        message: "Existing borrowed MB must be repaid first"
      });
    }

    const reference = "MBBORROW_" + crypto.randomUUID();

    const result = await executeMBTransaction({
      userId: user._id,
      type: "borrow",
      amount: BORROW_AMOUNT,
      reference,
      metadata: {
        source: "emergency-borrow"
      }
    });

    return res.status(200).json({
      message: "Emergency MB borrowed successfully",
      borrowed: BORROW_AMOUNT,
      balanceBefore: result.balanceBefore,
      balanceAfter: result.balanceAfter
    });

  } catch (error) {

    console.error("Borrow MB error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }
};
export const reserveMBController = async (req, res) => {
  try {

    const user = req.user;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid amount required"
      });
    }

    if (user.usableMB < amount) {
      return res.status(400).json({
        message: "Not enough usable MB to reserve"
      });
    }

    const reference = "MBRESERVE_" + crypto.randomUUID();

    const result = await executeMBTransaction({
      userId: user._id,
      type: "reserve",
      amount,
      reference,
      metadata: {
        source: "reserve-protection"
      }
    });

    return res.status(200).json({
      message: "MB reserved successfully",
      reserved: amount,
      balanceBefore: result.balanceBefore,
      balanceAfter: result.balanceAfter
    });

  } catch (error) {

    console.error("Reserve MB error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }
};export const releaseMBController = async (req, res) => {
  try {

    const user = req.user;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid amount required"
      });
    }

    if (user.reservedMB < amount) {
      return res.status(400).json({
        message: "Not enough reserved MB"
      });
    }

    const reference = "MBRELEASE_" + crypto.randomUUID();

    const result = await executeMBTransaction({
      userId: user._id,
      type: "release",
      amount,
      reference,
      metadata: {
        source: "release-reserve"
      }
    });

    return res.status(200).json({
      message: "Reserved MB released",
      released: amount,
      balanceBefore: result.balanceBefore,
      balanceAfter: result.balanceAfter
    });

  } catch (error) {

    console.error("Release MB error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }
};



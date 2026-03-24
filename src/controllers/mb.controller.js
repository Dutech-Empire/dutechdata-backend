import User from "../models/User.js";
import { executeMBTransaction } from "../services/mbLedger.service.js";
import { earnData } from "../services/earn.service.js";

// =========================
// 🎯 EARN CONTROLLER (FINAL)
// =========================
export const earnMBController = async (req, res) => {
  try {
    const result = await earnData(req.user._id, req);

    return res.status(200).json({
      success: true,
      message: "Data earned successfully",
      data: result,
    });

  } catch (error) {
    console.error("Earn MB error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// 💳 BORROW MB
// =========================
export const borrowMBController = async (req, res) => {
  try {
    const user = req.user;
    const BORROW_AMOUNT = 50;

    if (user.usableMB > 0) {
      return res.status(400).json({
        message: "Borrow allowed only when usable MB is zero"
      });
    }

    if (user.borrowedMB > 0) {
      return res.status(400).json({
        message: "Existing borrowed MB must be repaid first"
      });
    }

    const result = await executeMBTransaction({
      userId: user._id,
      type: "borrow",
      amount: BORROW_AMOUNT,
      reference: "MBBORROW_" + Date.now(),
      metadata: { source: "emergency-borrow" }
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

// =========================
// 🔒 RESERVE MB
// =========================
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

    const result = await executeMBTransaction({
      userId: user._id,
      type: "reserve",
      amount,
      reference: "MBRESERVE_" + Date.now(),
      metadata: { source: "reserve-protection" }
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
};

// =========================
// 🔓 RELEASE MB
// =========================
export const releaseMBController = async (req, res) => {
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

    const result = await executeMBTransaction({
      userId: user._id,
      type: "release",
      amount,
      reference: "MBRELEASE_" + Date.now(),
      metadata: { source: "release-reserve" }
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
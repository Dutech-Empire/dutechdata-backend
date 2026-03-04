import crypto from "crypto";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";




// POST /api/auth/request-otp
export const requestOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Basic E.164 validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone format" });
    }

    // Delete existing OTP for this phone (enforce single active)
    await Otp.deleteOne({ phoneNumber });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP using SHA256
    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // Set expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP record
    await Otp.create({
      phoneNumber,
      otpHash,
      expiresAt,
    });

    // DEV ONLY: Log OTP (remove when SMS is integrated)
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return res.status(200).json({
      message: "If this phone number is valid, an OTP has been sent.",
    });
  } catch (error) {
    console.error("OTP request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp, email } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        message: "Phone number and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ phoneNumber });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // Expiry check
    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ phoneNumber });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Attempt limit check
    if (otpRecord.attemptCount >= 5) {
      await Otp.deleteOne({ phoneNumber });
      return res.status(400).json({
        message: "Too many failed attempts",
      });
    }

    // Hash incoming OTP
    const incomingHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (incomingHash !== otpRecord.otpHash) {
      otpRecord.attemptCount += 1;
      await otpRecord.save();

      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP valid → delete record
    await Otp.deleteOne({ phoneNumber });

    // Create or fetch user
    let user = await User.findOne({ phone: phoneNumber });

if (!user) {

  if (!email) {
    return res.status(400).json({
      message: "Email is required for new users",
    });
  }

  user = await User.create({
    phone: phoneNumber,
    email: email,
  });

}

    // ✅ Generate Access Token (15 minutes)
    const accessToken = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Generate Refresh Token
    const rawRefreshToken = crypto.randomBytes(64).toString("hex");

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const refreshExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await Session.create({
      user: user._id,
      refreshTokenHash,
      expiresAt: refreshExpiresAt,
    });

    return res.status(200).json({
      message: "OTP verified successfully",
      accessToken,
      refreshToken: rawRefreshToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// POST /api/auth/refresh-token
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    // Hash incoming refresh token
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Find session
    const session = await Session.findOne({ refreshTokenHash });

    if (!session) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        message: "Refresh token expired",
      });
    }

    // Fetch user
    const user = await User.findById(session.user);

    if (!user || !user.isActive) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        message: "User not authorized",
      });
    }

    // 🔁 ROTATION STEP — Delete old session
    await Session.deleteOne({ _id: session._id });

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate new refresh token
    const rawRefreshToken = crypto.randomBytes(64).toString("hex");

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const refreshExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await Session.create({
      user: user._id,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: refreshExpiresAt,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: rawRefreshToken,
    });

  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

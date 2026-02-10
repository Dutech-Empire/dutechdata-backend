import User from "../models/User.js";

export const handleUserEntry = async (phone) => {
  // Normalize phone (basic for now)
  const normalizedPhone = phone.trim();

  // Check if user already exists
  let user = await User.findOne({ phone: normalizedPhone });

  if (user) {
    return user;
  }

  // Create new user with SAFE defaults
  user = await User.create({
    phone: normalizedPhone,
    walletBalance: 0,
    usableMB: 0,
    reservedMB: 0,
    borrowedMB: 0,
    earnedToday: 0,
    lastEarnedAt: null,
    isActive: true,
  });

  return user;
};

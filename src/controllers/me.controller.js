export const getMeController = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        walletBalance: user.walletBalance,
        usableMB: user.usableMB,
        reservedMB: user.reservedMB,
        borrowedMB: user.borrowedMB,
        earnedToday: user.earnedToday,
        isFrozen: user.isFrozen,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

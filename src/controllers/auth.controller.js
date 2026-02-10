import { handleUserEntry } from "../services/auth.service.js";

export const createOrGetUser = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const user = await handleUserEntry(phone);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("User entry error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

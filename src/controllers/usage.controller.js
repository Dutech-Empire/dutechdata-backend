import { getTodayUsage } from "../services/usage.service.js";

export const getUsageStats = async (req, res) => {
  try {

    const userId = req.user._id;

    const todayUsage = await getTodayUsage(userId);

    return res.status(200).json({
      success: true,
      data: {
        todayUsage
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
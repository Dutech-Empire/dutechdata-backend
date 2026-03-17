import { getUsageStats } from "../services/usage.service.js";

export const getUsageStatsController = async (req, res) => {
  try {

    const userId = req.user._id;

    const stats = await getUsageStats(userId);

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
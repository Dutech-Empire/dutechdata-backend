import { buyData } from "../services/buyData.service.js";

export const buyDataController = async (req, res) => {
  try {
    const { bundleId } = req.body;

    if (!bundleId) {
      return res.status(400).json({
        success: false,
        message: "bundleId is required",
      });
    }

    // 🔒 Identity comes ONLY from middleware
    const userId = req.user._id;

    const result = await buyData(userId, bundleId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

import { buyData } from "../services/buyData.service.js";

export const buyDataController = async (req, res) => {
  try {
    const { uid, bundleId } = req.body;

    if (!uid || !bundleId) {
      return res.status(400).json({
        success: false,
        message: "uid and bundleId are required",
      });
    }

    const result = await buyData(uid, bundleId);

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

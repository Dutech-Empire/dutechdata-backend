import { borrowMB } from "../services/borrow.service.js";

export const borrowController = async (req, res) => {
  try {
    // 🔒 Identity comes only from middleware
    const userId = req.user._id;

    const result = await borrowMB(userId);

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

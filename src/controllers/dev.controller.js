import { devFundWallet } from "../services/devFund.service.js";

export const fundWalletDev = async (req, res) => {
  try {
    if (process.env.DEV_MODE !== "true") {
      return res.status(403).json({
        success: false,
        message: "Dev route disabled",
      });
    }

    const { uid, amount } = req.body;

    if (!uid || !amount) {
      return res.status(400).json({
        success: false,
        message: "uid and amount are required",
      });
    }

    const tx = await devFundWallet(uid, amount);

    return res.status(200).json({
      success: true,
      data: tx,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

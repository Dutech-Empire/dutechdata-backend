import Transaction from "../models/Transaction.js";

export const getTransactionHistory = async (req, res) => {
  try {
    const user = req.user; // from authenticate middleware

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      userId: user._id,
    })
      .select("type currency amount reference status balanceBefore balanceAfter createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({
      userId: user._id,
    });

    return res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
      data: transactions,
    });

  } catch (error) {
    console.error("Transaction history error:", error);
    return res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
};
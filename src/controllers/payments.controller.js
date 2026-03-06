import { initializePayment } from "../services/payments/paystack.service.js";
import crypto from "crypto";
import axios from "axios";
import Transaction from "../models/Transaction.js";
import { executeTransaction } from "../services/ledger.service.js";
import PaymentIntent from "../models/PaymentIntent.js";
import User from "../models/User.js";


// ===============================
// 🔹 INITIALIZE PAYMENT
// ===============================
export const initializePaymentController = async (req, res) => {
  try {

    const { amount } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.email) {
      return res.status(400).json({
        message: "User email is required",
      });
    }
    const paymentData = await initializePayment({
      user,
      amount,
    });

    console.log("🔎 Paystack initialize response:", paymentData);

    // 🔥 FIX HERE
    const reference = paymentData.reference;

    await PaymentIntent.create({
      userId: user._id,
      reference,
      expectedAmount: amount * 100, // store in kobo
      currency: "NGN",
    });

    return res.status(200).json({
      message: "Payment initialized successfully",
      data: paymentData,
    });

  } catch (error) {
    console.error("Initialize payment error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};


// ===============================
// 🔹 PAYSTACK WEBHOOK
// ===============================
export const paystackWebhookController = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // 1️⃣ Validate Signature (RAW BODY)
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("❌ Invalid Paystack signature");
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const reference = event.data.reference;

    // 2️⃣ Idempotency check (ledger-level)
    const existingTransaction = await Transaction.findOne({ reference });
    if (existingTransaction) {
      console.log("⚠ Duplicate transaction ignored:", reference);
      return res.sendStatus(200);
    }

    // 3️⃣ Verify with Paystack API
    const verifyResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      }
    );

    const verifyData = verifyResponse.data;

    if (
      verifyData.status !== true ||
      verifyData.data.status !== "success"
    ) {
      console.log("❌ Paystack verification failed");
      return res.sendStatus(200);
    }

    // 4️⃣ Fetch PaymentIntent
    const intent = await PaymentIntent.findOne({ reference });

    if (!intent) {
      console.log("❌ No matching payment intent found");
      return res.sendStatus(200);
    }

    // 5️⃣ Strict Amount Cross-Check (Kobo vs Kobo)
    if (intent.expectedAmount !== verifyData.data.amount) {
      console.log("❌ Amount mismatch detected");
      return res.sendStatus(200);
    }

    // 6️⃣ Extract verified values
    const amountInNaira = verifyData.data.amount / 100;
    const currency = verifyData.data.currency;
    const userId = verifyData.data.metadata?.userId;

    if (!userId || currency !== "NGN") {
      console.log("❌ Invalid metadata or currency");
      return res.sendStatus(200);
    }

    // 7️⃣ Execute Ledger Credit
    await executeTransaction({
      userId,
      type: "credit",
      currency: "NGN",
      amount: amountInNaira,
      reference,
      metadata: { source: "paystack" },
    });

    // 8️⃣ Mark Intent Completed
    intent.status = "completed";
    await intent.save();

    console.log("✅ Wallet credited successfully:", reference);

    return res.sendStatus(200);

  } catch (error) {
    console.error("🔥 Webhook error:", error.message);
    return res.sendStatus(500);
  }
};
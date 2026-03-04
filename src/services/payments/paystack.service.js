import crypto from "crypto";
import axios from "axios";

export const initializePayment = async ({ user, amount }) => {

  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  if (!user.email) {
    throw new Error("User email is required");
  }

  // Paystack expects amount in kobo
  const amountInKobo = amount * 100;

  // Generate unique reference
  const reference = `DTX_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: user.email,
      amount: amountInKobo,
      reference,
      metadata: {
        userId: user._id.toString(),
        phone: user.phone,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.data.status) {
    throw new Error("Failed to initialize payment");
  }

  return {
    authorizationUrl: response.data.data.authorization_url,
    reference,
  };
};

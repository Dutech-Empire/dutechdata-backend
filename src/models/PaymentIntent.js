import mongoose from "mongoose";

const paymentIntentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
    },

    expectedAmount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    status: {
      type: String,
      enum: ["initialized", "completed", "failed"],
      default: "initialized",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentIntent", paymentIntentSchema);
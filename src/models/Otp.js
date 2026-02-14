import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Ensure only one active OTP per phone
otpSchema.index({ phoneNumber: 1 }, { unique: true });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;

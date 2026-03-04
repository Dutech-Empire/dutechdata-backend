import express from "express";
import { requestOtp, verifyOtp, refreshAccessToken } from "../controllers/auth.controller.js";
import { otpLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/request-otp", otpLimiter, requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh", refreshAccessToken);

export default router;
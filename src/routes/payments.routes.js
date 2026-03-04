import express from "express";
import {
  initializePaymentController,
  paystackWebhookController,
} from "../controllers/payments.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { strictLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// 🔹 Webhook route (NO auth, NO rate limit)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paystackWebhookController
);

// Everything below uses JSON parser
router.use(express.json());

// 🔹 Initialize payment (AUTH + STRICT LIMITER)
router.post(
  "/initialize",
  authenticate,
  strictLimiter,
  initializePaymentController
);

export default router;
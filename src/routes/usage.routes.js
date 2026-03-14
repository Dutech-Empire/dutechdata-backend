import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getUsageStats } from "../controllers/usage.controller.js";

const router = express.Router();

router.get("/stats", authenticate, getUsageStats);

export default router;
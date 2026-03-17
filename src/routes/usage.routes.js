import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getUsageStatsController } from "../controllers/usage.controller.js";

const router = express.Router();

router.get("/stats", authenticate, getUsageStatsController);

export default router;
import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  earnMBController,
  borrowMBController,
  reserveMBController,
  releaseMBController
} from "../controllers/mb.controller.js";
const router = express.Router();

router.post("/earn", authenticate, earnMBController);
router.post("/borrow", authenticate, borrowMBController);
router.post("/reserve", authenticate, reserveMBController);
router.post("/release", authenticate, releaseMBController);

export default router;
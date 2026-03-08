import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { earnMBController } from "../controllers/mb.controller.js";

const router = express.Router();

router.post("/earn", authenticate, earnMBController);

export default router;
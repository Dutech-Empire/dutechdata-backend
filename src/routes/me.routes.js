
import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getMeController } from "../controllers/me.controller.js";

const router = express.Router();

router.get("/", authenticate, getMeController);

export default router;

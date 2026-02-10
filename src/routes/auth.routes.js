import express from "express";
import { createOrGetUser } from "../controllers/auth.controller.js";

const router = express.Router();

// TEMP: phone-based entry (OTP later)
router.post("/enter", createOrGetUser);

export default router;

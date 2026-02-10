import express from "express";
import { fundWalletDev } from "../controllers/dev.controller.js";

const router = express.Router();

router.post("/fund-wallet", fundWalletDev);

export default router;

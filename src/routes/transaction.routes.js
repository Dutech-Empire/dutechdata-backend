import express from "express";
import { getTransactionHistory } from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();


// Authenticated transaction history
router.get("/history", authenticate, getTransactionHistory);


export default router;

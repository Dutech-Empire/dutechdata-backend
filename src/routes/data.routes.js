import express from "express";
import { buyDataController } from "../controllers/buyData.controller.js";

const router = express.Router();

router.post("/buy", buyDataController);

export default router;

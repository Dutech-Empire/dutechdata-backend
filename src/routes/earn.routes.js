import express from "express";
import { earnDataController } from "../controllers/earn.controller.js";

const router = express.Router();

router.post("/earn", earnDataController);

export default router;

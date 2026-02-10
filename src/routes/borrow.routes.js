import express from "express";
import { borrowController } from "../controllers/borrow.controller.js";

const router = express.Router();

router.post("/borrow", borrowController);

export default router;

import express from "express";
import { borrowController } from "../controllers/borrow.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/", authenticate, borrowController);


export default router;

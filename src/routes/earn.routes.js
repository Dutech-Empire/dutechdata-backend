import express from "express";
import { earnDataController } from "../controllers/earn.controller.js";

const router = express.Router();

if (process.env.ENABLE_EARN === "true") {
  router.post("/earn", authenticate, earnDataController);
}


export default router;

import express from "express";
import { buyDataController } from "../controllers/buyData.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post("/buy", buyDataController);
router.get("/test-protected", authenticate, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user.phone,
  });
});



export default router;

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js"; // ✅ ADD THIS
import dataRoutes from "./routes/data.routes.js";
//import devRoutes from "./routes/dev.routes.js";//
import earnRoutes from "./routes/earn.routes.js";
import borrowRoutes from "./routes/borrow.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import mbRoutes from "./routes/mb.routes.js";







const app = express();

app.use(cors());

// 🔴 Mount payments FIRST (so webhook gets raw body)
app.use("/api/payments", paymentsRoutes);


app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);


// 🔵 THEN enable JSON parser for everything else
app.use(express.json());
app.use(globalLimiter);

app.use("/api/data", dataRoutes);
//app.use("/api/dev", devRoutes);
app.use("/api/earn", earnRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/mb", mbRoutes);



// Root status endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    service: "DutechData Backend API",
    status: "Live",
    phase: "Phase II - Identity & Financial Integrity",
  });
});

// Health check
// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Auth / User entry routes
app.use("/api/auth", authRoutes); // ✅ ADD THIS

export default app;

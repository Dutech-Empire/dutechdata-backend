import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js"; // ✅ ADD THIS
import dataRoutes from "./routes/data.routes.js";
//import devRoutes from "./routes/dev.routes.js";//
import earnRoutes from "./routes/earn.routes.js";
import borrowRoutes from "./routes/borrow.routes.js";





const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/data", dataRoutes);
//app.use("/api/dev", devRoutes);//
app.use("/api/earn", earnRoutes);
app.use("/api/borrow", borrowRoutes);


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

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






// Health check
app.get(["/", "/api"], (req, res) => {
  res.json({ status: "DutechData backend is alive" });
});
// Auth / User entry routes
app.use("/api/auth", authRoutes); // ✅ ADD THIS

export default app;

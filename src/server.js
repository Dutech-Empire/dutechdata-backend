import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DutechData backend running on port ${PORT}`);
});

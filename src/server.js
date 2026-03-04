import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import app from "./app.js";
import connectDB from "./config/db.js";
import { startReconciliationJob, runReconciliationNow } from "./jobs/reconciliation.job.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
     await runReconciliationNow();

    

    // 🔴 Start reconciliation AFTER DB is ready
    startReconciliationJob();
    
   
    app.listen(PORT, () => {
      console.log(`DutechData backend running on port ${PORT}`);

    });
    
    

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
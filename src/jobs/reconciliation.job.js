import cron from "node-cron";
import User from "../models/User.js";
import { reconcileWallet } from "../services/wallet/reconciliation.service.js";
import { triggerCriticalAlert } from "../utils/alert.util.js";

// 🔹 Daily scheduled reconciliation (Runs at 2AM)
export const startReconciliationJob = () => {
  cron.schedule("0 2 * * *", async () => {
    console.log("🔍 Starting daily reconciliation...");

    try {
      const users = await User.find({}, "_id");

      for (const user of users) {
        const result = await reconcileWallet(user._id);

        if (!result.isBalanced) {
          console.error(
            `❌ Reconciliation mismatch for user ${user._id}`,
            result
          );

          // 🚨 Trigger structured alert
          await triggerCriticalAlert("RECONCILIATION_MISMATCH", {
            userId: user._id,
            details: result,
          });
        }
      }

      console.log("✅ Reconciliation completed");
    } catch (error) {
      console.error("🚨 Reconciliation job failed:", error.message);

      await triggerCriticalAlert("RECONCILIATION_JOB_FAILURE", {
        error: error.message,
      });
    }
  });
};

// 🔹 Manual reconciliation (for testing)
export const runReconciliationNow = async () => {
  console.log("🔍 Manual reconciliation started...");

  try {
    const users = await User.find({}, "_id");

    for (const user of users) {
      const result = await reconcileWallet(user._id);

      if (!result.isBalanced) {
        console.error(
          `❌ Reconciliation mismatch for user ${user._id}`,
          result
        );

        // 🚨 Trigger structured alert
        await triggerCriticalAlert("RECONCILIATION_MISMATCH", {
          userId: user._id,
          details: result,
        });
      } else {
        console.log(`✅ User ${user._id} balanced`);
      }
    }

    console.log("✅ Manual reconciliation completed");
  } catch (error) {
    console.error("🚨 Manual reconciliation failed:", error.message);

    await triggerCriticalAlert("RECONCILIATION_MANUAL_FAILURE", {
      error: error.message,
    });
  }
};
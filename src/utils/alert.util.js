import Alert from "../models/Alert.js";

export const triggerCriticalAlert = async (type, details) => {
  const timestamp = new Date().toISOString();

  console.error("🚨🚨🚨 CRITICAL SYSTEM ALERT 🚨🚨🚨");
  console.error("Type:", type);
  console.error("Time:", timestamp);
  console.error("Details:", details);
  console.error("====================================");

  try {

    const saved = await Alert.create({
      type,
      severity: "CRITICAL",
      message: `System alert triggered: ${type}`,
      details,
    });


  } catch (error) {
    console.error("⚠ Failed to persist alert:", error);
  }
};
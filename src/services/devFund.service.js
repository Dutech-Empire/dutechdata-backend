import { applyTransaction } from "./ledger.service.js";

export const devFundWallet = async (uid, amount) => {
  return await applyTransaction({
    uid,
    type: "credit",
    source: "earn", // treated as system credit
    amount,
    currency: "NGN",
    description: "DEV wallet funding (testing only)",
  });
};

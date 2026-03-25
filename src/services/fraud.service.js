export const calculateRiskScore = (user) => {
  let score = 0;

  // =========================
  // 🌍 IP ANALYSIS
  // =========================
  if (user.knownIPs.length > 3) {
    score += 20;
  }

  // =========================
  // 📱 DEVICE ANALYSIS
  // =========================
  if (user.knownDevices.length > 2) {
    score += 20;
  }

  // =========================
  // ⚡ EARN ATTEMPTS
  // =========================
  if (user.earnAttempts > 10) {
    score += 30;
  }

  // =========================
  // 🚨 EXTREME BEHAVIOR
  // =========================
  if (user.earnAttempts > 20) {
    score += 30;
  }

  return Math.min(score, 100);
};
export const evaluateUserRisk = (user) => {
  const riskScore = calculateRiskScore(user);

  user.riskScore = riskScore;

  if (riskScore >= 70) {
    user.isBlocked = true;
  }

  return riskScore;
};
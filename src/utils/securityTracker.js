export const trackUserAccess = (req, user) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const userAgent = req.headers["user-agent"] || "unknown";

  // Save last access
  user.lastIP = ip;
  user.lastUserAgent = userAgent;

  // Store unique IPs
  if (!user.knownIPs.includes(ip)) {
    user.knownIPs.push(ip);
  }

  // Store unique devices
  if (!user.knownDevices.includes(userAgent)) {
    user.knownDevices.push(userAgent);
  }
};
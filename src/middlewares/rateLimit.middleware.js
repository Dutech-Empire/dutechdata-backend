import rateLimit from "express-rate-limit";

// 🔹 Global limiter (all routes)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
  },
});

// 🔹 Strict limiter (sensitive financial routes)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many attempts. Please try again later.",
  },
});

// 🔹 OTP limiter (very strict)
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 OTP attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many OTP attempts. Please wait before retrying.",
  },
});
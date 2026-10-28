import rateLimit from 'express-rate-limit';

// Global quota protects the API from abuse while still allowing normal usage in a
// single-node deployment.
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests from this IP. Please try again later.'
    }
  }
});

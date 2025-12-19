import rateLimit from 'express-rate-limit';

// Rate limiter for flag submissions
export const submissionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 submissions per minute per IP
  message: { error: 'Too many submission attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for authentication
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // max 5 attempts in production, 100 in development
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // In development, be more lenient
    if (process.env.NODE_ENV !== 'production') {
      return false; // Still apply rate limiting but with higher limit
    }
    return false;
  }
});

// Rate limiter for general API
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // max 500 requests per 15 minutes (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
});


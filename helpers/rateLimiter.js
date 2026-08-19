import rateLimit from 'express-rate-limit';

export function createRateLimiter({
    windowMs,
    limit,
    message = 'Too many requests. Please try again later.',
}) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: {
            error: 'RATE_LIMIT_EXCEEDED',
            message,
        },
    });
}
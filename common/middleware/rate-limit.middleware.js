import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

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
        keyGenerator: (req) => ipKeyGenerator(req.headers["cf-connecting-ip"] || req.ip),
    });
}

export function catchAllLimiter() {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 30,
        message: {
            error: 'RATE_LIMIT_EXCEEDED',
            message: "Too many failed 404 requests from this IP, please try again after 15 minutes",
        },
        keyGenerator: (req) => ipKeyGenerator(req.headers["cf-connecting-ip"] || req.ip),
    });
}
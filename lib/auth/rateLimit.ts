/**
 * Rate Limiter
 * ============
 * Simple in-memory rate limiting for API routes
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
}

// Default configs for different endpoints
export const RATE_LIMIT_CONFIGS = {
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },  // 10 requests per 15 min
    login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },   // 5 login attempts per 15 min
    register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 registrations per hour
    passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 reset requests per hour
    api: { windowMs: 60 * 1000, maxRequests: 100 },  // 100 requests per minute
};

/**
 * Clean up expired entries periodically
 */
function cleanup() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanup, 5 * 60 * 1000);
}

/**
 * Check rate limit for a key
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig = RATE_LIMIT_CONFIGS.api
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // If no entry or expired, create new one
    if (!entry || entry.resetTime < now) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs,
        };
    }

    // Increment count
    entry.count++;

    // Check if over limit
    if (entry.count > config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}

/**
 * Get rate limit key from IP or identifier
 */
export function getRateLimitKey(
    identifier: string,
    endpoint: string
): string {
    return `${endpoint}:${identifier}`;
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export function resetRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

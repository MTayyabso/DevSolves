/**
 * Auth Module Index
 * =================
 * Barrel export for all auth utilities
 */

export {
    signAccessToken,
    signRefreshToken,
    verifyToken,
    setAuthCookies,
    clearAuthCookies,
    getTokensFromCookies,
    getCurrentUser,
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
} from './jwt';

export {
    generateToken,
    hashToken,
    sendVerificationEmail,
    sendPasswordResetEmail,
} from './email';

export {
    checkRateLimit,
    getRateLimitKey,
    resetRateLimit,
    RATE_LIMIT_CONFIGS,
} from './rateLimit';

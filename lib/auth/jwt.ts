/**
 * JWT Authentication Utility
 * ==========================
 * Handles JWT token generation, verification, and cookie management
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// JWT Secret - MUST be set in environment
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Cookie names
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

interface DecodedToken extends TokenPayload {
    iat: number;
    exp: number;
}

/**
 * Parse duration string to milliseconds
 */
function parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return 15 * 60 * 1000;
    }
}

/**
 * Simple base64url encoding/decoding
 */
function base64urlEncode(str: string): string {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64urlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString();
}

/**
 * Create HMAC signature
 */
async function createSignature(data: string, secret: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Sign a JWT token (without jsonwebtoken dependency)
 */
async function signToken(payload: TokenPayload, expiresIn: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + Math.floor(parseDuration(expiresIn) / 1000);

    const fullPayload = {
        ...payload,
        iat: now,
        exp,
    };

    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
    const signature = await createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<DecodedToken | null> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [encodedHeader, encodedPayload, signature] = parts;

        // Verify signature
        const expectedSignature = await createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
        if (signature !== expectedSignature) return null;

        // Decode payload
        const payload = JSON.parse(base64urlDecode(encodedPayload)) as DecodedToken;

        // Check expiration
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;

        return payload;
    } catch {
        return null;
    }
}

/**
 * Sign access token (short-lived)
 */
export async function signAccessToken(payload: TokenPayload): Promise<string> {
    return signToken(payload, JWT_EXPIRES_IN);
}

/**
 * Sign refresh token (long-lived)
 */
export async function signRefreshToken(payload: TokenPayload): Promise<string> {
    return signToken(payload, JWT_REFRESH_EXPIRES_IN);
}

/**
 * Set auth cookies on response
 */
export function setAuthCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string
): NextResponse {
    const accessMaxAge = parseDuration(JWT_EXPIRES_IN) / 1000;
    const refreshMaxAge = parseDuration(JWT_REFRESH_EXPIRES_IN) / 1000;

    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: accessMaxAge,
        path: '/',
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: refreshMaxAge,
        path: '/',
    });

    return response;
}

/**
 * Clear auth cookies (logout)
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
    response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });

    return response;
}

/**
 * Get tokens from cookies (for API routes)
 */
export async function getTokensFromCookies(): Promise<{
    accessToken: string | undefined;
    refreshToken: string | undefined;
}> {
    const cookieStore = await cookies();
    return {
        accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
        refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
    };
}

/**
 * Verify current user from cookies
 */
export async function getCurrentUser(): Promise<DecodedToken | null> {
    const { accessToken } = await getTokensFromCookies();
    if (!accessToken) return null;
    return verifyToken(accessToken);
}

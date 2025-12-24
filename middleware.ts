/**
 * Auth Middleware
 * ===============
 * Protects routes requiring authentication
 * Uses Web Crypto API (Edge Runtime compatible)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie name
const ACCESS_TOKEN_COOKIE = 'access_token';

// Routes that require authentication
const protectedRoutes = [
    '/dashboard',
];

// Routes that should redirect to dashboard if logged in
const authRoutes = [
    '/login',
    '/register',
];

// Public routes (no checks needed)
const publicRoutes = [
    '/',
    '/verify-email',
    '/reset-password',
    '/forgot-password',
];

/**
 * Verify JWT token using Web Crypto API (Edge compatible)
 * Returns payload if valid, null if invalid
 */
async function verifyTokenEdge(token: string): Promise<{ valid: boolean; isVerified?: boolean }> {
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

        const parts = token.split('.');
        if (parts.length !== 3) return { valid: false };

        const [encodedHeader, encodedPayload, signature] = parts;

        // Create signature using Web Crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
        const keyData = encoder.encode(JWT_SECRET);

        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
        const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        if (signature !== expectedSignature) return { valid: false };

        // Decode and check expiry
        const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));

        if (payload.exp < Math.floor(Date.now() / 1000)) return { valid: false };

        return { valid: true, isVerified: payload.isVerified };
    } catch {
        return { valid: false };
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip for static files and API routes (except protected ones)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Get access token from cookies
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    // Verify token if present
    let isAuthenticated = false;
    let tokenResult = { valid: false, isVerified: false };
    if (accessToken) {
        tokenResult = await verifyTokenEdge(accessToken);
        isAuthenticated = tokenResult.valid;
    }

    // Check if accessing protected route
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Check if accessing auth route (login/register)
    const isAuthRoute = authRoutes.some(route =>
        pathname === route || pathname.startsWith(route)
    );

    // If accessing protected route without auth OR without verification, redirect to login
    if (isProtectedRoute && (!isAuthenticated || !tokenResult.isVerified)) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If accessing auth routes while logged in AND verified, redirect to dashboard
    // (Unverified users can still access login to get new verified token)
    if (isAuthRoute && isAuthenticated && tokenResult.isVerified) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, icon.svg (favicon files)
         */
        '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
    ],
};

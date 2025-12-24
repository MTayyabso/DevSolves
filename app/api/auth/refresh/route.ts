/**
 * Refresh Token API
 * =================
 * Refreshes access token using refresh token
 */

import { NextResponse } from 'next/server';
import {
    verifyToken,
    signAccessToken,
    getTokensFromCookies,
    setAuthCookies,
    signRefreshToken,
} from '@/lib/auth';

export async function POST() {
    try {
        const { refreshToken } = await getTokensFromCookies();

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: 'No refresh token provided' },
                { status: 401 }
            );
        }

        // Verify refresh token
        const decoded = await verifyToken(refreshToken);

        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired refresh token' },
                { status: 401 }
            );
        }

        // Generate new tokens (token rotation)
        const tokenPayload = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        const newAccessToken = await signAccessToken(tokenPayload);
        const newRefreshToken = await signRefreshToken(tokenPayload);

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Token refreshed successfully',
        });

        // Set new cookies
        return setAuthCookies(response, newAccessToken, newRefreshToken);

    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}

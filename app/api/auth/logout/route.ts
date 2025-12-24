/**
 * Logout API
 * ==========
 * Clears auth cookies
 */

import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });

        return clearAuthCookies(response);

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred during logout' },
            { status: 500 }
        );
    }
}

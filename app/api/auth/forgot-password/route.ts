/**
 * Forgot Password API
 * ===================
 * Sends password reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import {
    generateToken,
    hashToken,
    sendPasswordResetEmail,
    checkRateLimit,
    getRateLimitKey,
    RATE_LIMIT_CONFIGS,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitKey = getRateLimitKey(ip, 'passwordReset');
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.passwordReset);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Too many requests. Please try again later.',
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
                    },
                }
            );
        }

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        const successResponse = {
            success: true,
            message: 'If an account exists with that email, a password reset link has been sent.',
        };

        if (!user) {
            return NextResponse.json(successResponse);
        }

        // Generate reset token
        const resetToken = generateToken();
        const hashedToken = hashToken(resetToken);

        // Save token with 1 hour expiry
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // Send reset email
        await sendPasswordResetEmail(user.email, user.name, resetToken);

        return NextResponse.json(successResponse);

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}

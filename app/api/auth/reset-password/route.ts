/**
 * Reset Password API
 * ==================
 * Resets password using valid token
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import { hashToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Token and password are required',
                    errors: {
                        token: !token ? 'Reset token is required' : undefined,
                        password: !password ? 'New password is required' : undefined,
                    }
                },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Password too short',
                    errors: { password: 'Password must be at least 8 characters' }
                },
                { status: 400 }
            );
        }

        await dbConnect();

        // Hash the token to compare with stored hash
        const hashedToken = hashToken(token);

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }, // Token not expired
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid or expired reset token',
                    errors: { token: 'This reset link is invalid or has expired' }
                },
                { status: 400 }
            );
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.',
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred while resetting password' },
            { status: 500 }
        );
    }
}

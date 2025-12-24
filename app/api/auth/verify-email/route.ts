/**
 * Email Verification API
 * ======================
 * Verifies user email via token
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import { hashToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Verification token is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Hash the token to compare with stored hash
        const hashedToken = hashToken(token);

        // Find user with matching verification token
        const user = await User.findOne({
            verificationToken: hashedToken,
        }).select('+verificationToken');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully. You can now log in.',
        });

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred during verification' },
            { status: 500 }
        );
    }
}

/**
 * Resend verification email
 */
export async function POST(request: NextRequest) {
    try {
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

        if (!user) {
            // Don't reveal if user exists
            return NextResponse.json({
                success: true,
                message: 'If an account exists, a verification email has been sent.',
            });
        }

        if (user.isVerified) {
            return NextResponse.json({
                success: true,
                message: 'Email is already verified.',
            });
        }

        // Generate new verification token
        const { generateToken, sendVerificationEmail } = await import('@/lib/auth');
        const verificationToken = generateToken();
        const hashedToken = hashToken(verificationToken);

        user.verificationToken = hashedToken;
        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, user.name, verificationToken);

        return NextResponse.json({
            success: true,
            message: 'Verification email sent. Please check your inbox.',
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}

/**
 * Login API Route
 * ================
 * Handles user authentication with JWT tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import {
    signAccessToken,
    signRefreshToken,
    setAuthCookies,
    checkRateLimit,
    getRateLimitKey,
    resetRateLimit,
    RATE_LIMIT_CONFIGS,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitKey = getRateLimitKey(ip, 'login');
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.login);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Too many login attempts. Please try again later.',
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
                    },
                }
            );
        }

        // Connect to database
        await dbConnect();

        // Parse request body
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email and password are required',
                    errors: {
                        email: !email ? 'Email is required' : undefined,
                        password: !password ? 'Password is required' : undefined,
                    }
                },
                { status: 400 }
            );
        }

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid credentials',
                    errors: { email: 'No account found with this email' }
                },
                { status: 401 }
            );
        }

        // Compare passwords
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid credentials',
                    errors: { password: 'Incorrect password' }
                },
                { status: 401 }
            );
        }

        // Check if email is verified
        if (!user.isVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Please verify your email before logging in',
                    errors: { email: 'Email not verified. Check your inbox for the verification link.' },
                    requiresVerification: true,
                },
                { status: 403 }
            );
        }

        // Reset rate limit on successful login
        resetRateLimit(rateLimitKey);

        // Update last login timestamp
        user.lastLoginAt = new Date();
        await user.save();

        // Generate JWT tokens (include isVerified for middleware checks)
        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        };

        const accessToken = await signAccessToken(tokenPayload);
        const refreshToken = await signRefreshToken(tokenPayload);

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                reputation: user.reputation,
                isVerified: user.isVerified,
            },
        });

        // Set auth cookies
        return setAuthCookies(response, accessToken, refreshToken);

    } catch (error) {
        console.error('Login error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during login. Please try again.',
            },
            { status: 500 }
        );
    }
}

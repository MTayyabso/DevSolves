/**
 * Registration API Route
 * ======================
 * Handles user registration with JWT tokens and email verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import {
    signAccessToken,
    signRefreshToken,
    setAuthCookies,
    generateToken,
    hashToken,
    sendVerificationEmail,
    checkRateLimit,
    getRateLimitKey,
    RATE_LIMIT_CONFIGS,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitKey = getRateLimitKey(ip, 'register');
        const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.register);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Too many registration attempts. Please try again later.',
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
        const { name, email, password } = body;

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'All fields are required',
                    errors: {
                        name: !name ? 'Name is required' : undefined,
                        email: !email ? 'Email is required' : undefined,
                        password: !password ? 'Password is required' : undefined,
                    }
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid email format',
                    errors: { email: 'Please enter a valid email address' }
                },
                { status: 400 }
            );
        }

        // Validate password length
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

        // Check for existing user
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email already registered',
                    errors: { email: 'An account with this email already exists' }
                },
                { status: 409 }
            );
        }

        // Generate verification token
        const verificationToken = generateToken();
        const hashedVerificationToken = hashToken(verificationToken);

        // Create new user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            verificationToken: hashedVerificationToken,
            isVerified: false,
        });

        // Send verification email
        await sendVerificationEmail(email, name, verificationToken);

        // Generate JWT tokens
        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken = await signAccessToken(tokenPayload);
        const refreshToken = await signRefreshToken(tokenPayload);

        // Create response with user data
        const response = NextResponse.json(
            {
                success: true,
                message: 'Account created successfully. Please check your email to verify your account.',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                },
            },
            { status: 201 }
        );

        // Set auth cookies
        return setAuthCookies(response, accessToken, refreshToken);

    } catch (error) {
        console.error('Registration error:', error);

        // Handle Mongoose validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors: { general: error.message }
                },
                { status: 400 }
            );
        }

        // Handle duplicate key error
        if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email already registered',
                    errors: { email: 'An account with this email already exists' }
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during registration. Please try again.',
            },
            { status: 500 }
        );
    }
}

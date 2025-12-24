/**
 * Get Current User API
 * ====================
 * Returns current authenticated user
 */

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        // Get user from JWT
        const tokenData = await getCurrentUser();

        if (!tokenData) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get fresh user data from database
        const user = await User.findById(tokenData.userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                reputation: user.reputation,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
            },
        });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred' },
            { status: 500 }
        );
    }
}

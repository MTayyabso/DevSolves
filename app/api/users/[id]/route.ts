/**
 * Example API Route - Get User by ID
 * ===================================
 * Demonstrates proper usage of dbConnect and models
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';

// GET /api/users/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Always connect before using models
        await dbConnect();

        const { id } = await params;

        // Find user by ID
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        // Prevent updating sensitive fields
        const { password, email, role, ...updateData } = body;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

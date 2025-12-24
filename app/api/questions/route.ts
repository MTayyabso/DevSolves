/**
 * Example API Route - Questions List
 * ===================================
 * Demonstrates searching, filtering, and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Question } from '@/lib/models';

// GET /api/questions - List questions with filtering
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'newest';

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (tag) {
            query.tags = tag.toLowerCase();
        }

        // Sorting options
        type SortOrder = 1 | -1;
        const sortOptions: Record<string, Record<string, SortOrder>> = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            votes: { 'upvotes.length': -1 },
            views: { views: -1 },
        };

        let questions;

        if (search) {
            // Text search
            questions = await Question.find(
                { $text: { $search: search }, ...query },
                { score: { $meta: 'textScore' } }
            )
                .populate('author', 'name avatar reputation')
                .sort({ score: { $meta: 'textScore' } })
                .skip((page - 1) * limit)
                .limit(limit);
        } else {
            // Regular query
            questions = await Question.find(query)
                .populate('author', 'name avatar reputation')
                .sort(sortOptions[sort] || sortOptions.newest)
                .skip((page - 1) * limit)
                .limit(limit);
        }

        const total = await Question.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: questions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/questions - Create new question
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Get user from JWT cookie
        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify and decode token
        let userId: string | null = null;
        try {
            const parts = accessToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                // Check if token is expired
                if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                    return NextResponse.json(
                        { success: false, message: 'Token expired' },
                        { status: 401 }
                    );
                }
                userId = payload.userId;
            }
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, body: questionBody, tags } = body;

        const question = await Question.create({
            title,
            body: questionBody,
            tags: tags?.map((t: string) => t.toLowerCase()) || [],
            author: userId,
        });

        await question.populate('author', 'name avatar reputation');

        return NextResponse.json({
            success: true,
            data: question,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating question:', error);

        // Handle validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

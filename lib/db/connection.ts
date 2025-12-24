/**
 * MongoDB Connection Utility
 * ==========================
 * Production-ready, serverless-safe MongoDB connection for Next.js
 * 
 * Features:
 * - Singleton pattern prevents multiple connections
 * - Hot reload safe for development
 * - Proper error handling and logging
 * - Connection state caching for serverless
 * - TypeScript support
 */

import mongoose from 'mongoose';

// TypeScript: Extend global to cache connection in development
declare global {
    // eslint-disable-next-line no-var
    var mongooseConnection: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    } | undefined;
}

// Connection options optimized for production
const MONGODB_OPTIONS: mongoose.ConnectOptions = {
    bufferCommands: true,
    maxPoolSize: 10,           // Maximum number of connections in pool
    minPoolSize: 5,            // Minimum number of connections
    socketTimeoutMS: 45000,    // Close sockets after 45 seconds of inactivity
    serverSelectionTimeoutMS: 10000, // Timeout for server selection
    heartbeatFrequencyMS: 10000,     // How often to check server status
};

// Validate environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local\n' +
        'Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname'
    );
}

/**
 * Global connection cache
 * In development: Cached in global to survive hot reloads
 * In production: Cached in module scope
 */
let cached = global.mongooseConnection;

if (!cached) {
    cached = global.mongooseConnection = { conn: null, promise: null };
}

/**
 * Connect to MongoDB
 * 
 * This function handles connection caching to prevent multiple connections
 * in serverless/edge environments and during hot reloads.
 * 
 * @returns Promise<typeof mongoose> - Mongoose instance
 * 
 * @example
 * // In API route or Server Component
 * import dbConnect from '@/lib/db/connection';
 * 
 * export async function GET() {
 *   await dbConnect();
 *   // Now you can use your models
 * }
 */
async function dbConnect(): Promise<typeof mongoose> {
    // Return cached connection if available
    if (cached!.conn) {
        console.log('📦 Using cached database connection');
        return cached!.conn;
    }

    // If no promise exists, create one
    if (!cached!.promise) {
        console.log('🔌 Connecting to MongoDB...');

        cached!.promise = mongoose
            .connect(MONGODB_URI!, MONGODB_OPTIONS)
            .then((mongoose) => {
                console.log('✅ MongoDB connected successfully');
                return mongoose;
            })
            .catch((error) => {
                console.error('❌ MongoDB connection error:', error.message);
                cached!.promise = null; // Reset promise so we can retry
                throw error;
            });
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (error) {
        cached!.promise = null;
        throw error;
    }

    return cached!.conn;
}

/**
 * Disconnect from MongoDB
 * Useful for testing or graceful shutdown
 */
export async function dbDisconnect(): Promise<void> {
    if (cached!.conn) {
        await mongoose.disconnect();
        cached!.conn = null;
        cached!.promise = null;
        console.log('🔌 MongoDB disconnected');
    }
}

/**
 * Check connection status
 */
export function isConnected(): boolean {
    return mongoose.connection.readyState === 1;
}

/**
 * Get connection state as string
 */
export function getConnectionState(): string {
    const states: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return states[mongoose.connection.readyState] || 'unknown';
}

export default dbConnect;

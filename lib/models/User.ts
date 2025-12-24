/**
 * User Model
 * ==========
 * Example of a production-ready Mongoose model with:
 * - TypeScript types
 * - Proper schema validation
 * - Model overwrite protection
 * - Indexes for performance
 * - Instance and static methods
 * - Timestamps
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

// ============================================
// TypeScript Interfaces
// ============================================

/**
 * Core user data (what we store in DB)
 */
export interface IUser {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: 'user' | 'moderator' | 'admin';
    reputation: number;
    isVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User document (includes Mongoose document methods)
 */
export interface IUserDocument extends IUser, Document {
    // Instance methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateVerificationToken(): string;
}

/**
 * User model (includes static methods)
 */
export interface IUserModel extends Model<IUserDocument> {
    // Static methods
    findByEmail(email: string): Promise<IUserDocument | null>;
    findByVerificationToken(token: string): Promise<IUserDocument | null>;
}

// ============================================
// Schema Definition
// ============================================

const UserSchema = new Schema<IUserDocument, IUserModel>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't include password in queries by default
        },
        avatar: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: {
                values: ['user', 'moderator', 'admin'],
                message: 'Role must be user, moderator, or admin',
            },
            default: 'user',
        },
        reputation: {
            type: Number,
            default: 0,
            min: [0, 'Reputation cannot be negative'],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            select: false,
        },
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpires: {
            type: Date,
            select: false,
        },
        lastLoginAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        toJSON: {
            // Transform output when converting to JSON
            transform: (_, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                return ret;
            },
        },
    }
);

// ============================================
// Indexes (for query performance)
// ============================================

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ reputation: -1 });
UserSchema.index({ role: 1 });

// ============================================
// Instance Methods
// ============================================

/**
 * Compare password with hashed password
 * Note: You'll need bcrypt for this to work
 */
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    // Import bcrypt here to avoid issues if not installed yet
    try {
        const bcrypt = await import('bcryptjs');
        return bcrypt.compare(candidatePassword, this.password);
    } catch {
        console.warn('bcryptjs not installed. Install it for password comparison.');
        return false;
    }
};

/**
 * Generate email verification token
 */
UserSchema.methods.generateVerificationToken = function (): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    return token;
};

// ============================================
// Static Methods
// ============================================

/**
 * Find user by email
 */
UserSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find user by verification token
 */
UserSchema.statics.findByVerificationToken = function (token: string) {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return this.findOne({ verificationToken: hashedToken });
};

// ============================================
// Pre-save Middleware (Password Hashing)
// ============================================

UserSchema.pre('save', async function () {
    // Only hash password if it's modified
    if (!this.isModified('password')) {
        return;
    }

    try {
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
});

// ============================================
// Model Export with Overwrite Protection
// ============================================

/**
 * This pattern prevents model overwrite errors in Next.js development
 * where hot reloads can cause models to be redefined.
 * 
 * mongoose.models.User - Checks if model already exists
 * mongoose.model() - Creates new model if doesn't exist
 */
const User: IUserModel =
    (mongoose.models.User as IUserModel) ||
    mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;

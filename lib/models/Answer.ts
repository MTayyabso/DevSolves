/**
 * Answer Model
 * ============
 * Model for answers to questions
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ============================================
// TypeScript Interfaces
// ============================================

export interface IAnswer {
    body: string;
    author: Types.ObjectId;
    question: Types.ObjectId;
    upvotes: Types.ObjectId[];
    downvotes: Types.ObjectId[];
    isAccepted: boolean;
    comments: {
        body: string;
        author: Types.ObjectId;
        createdAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IAnswerDocument extends IAnswer, Document {
    voteScore: number;
}

export interface IAnswerModel extends Model<IAnswerDocument> { }

// ============================================
// Schema Definition
// ============================================

const AnswerSchema = new Schema<IAnswerDocument, IAnswerModel>(
    {
        body: {
            type: String,
            required: [true, 'Answer body is required'],
            minlength: [30, 'Answer must be at least 30 characters'],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        question: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        },
        upvotes: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        downvotes: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        isAccepted: {
            type: Boolean,
            default: false,
        },
        comments: [{
            body: { type: String, required: true, maxlength: 600 },
            author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            createdAt: { type: Date, default: Date.now },
        }],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ============================================
// Virtuals
// ============================================

AnswerSchema.virtual('voteScore').get(function () {
    return this.upvotes.length - this.downvotes.length;
});

// ============================================
// Indexes
// ============================================

AnswerSchema.index({ question: 1, createdAt: -1 });
AnswerSchema.index({ author: 1 });
AnswerSchema.index({ isAccepted: 1 });

// ============================================
// Model Export
// ============================================

const Answer: IAnswerModel =
    (mongoose.models.Answer as IAnswerModel) ||
    mongoose.model<IAnswerDocument, IAnswerModel>('Answer', AnswerSchema);

export default Answer;

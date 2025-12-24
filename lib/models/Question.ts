/**
 * Question Model
 * ==============
 * Model for Q&A questions with tags, votes, and answers reference
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ============================================
// TypeScript Interfaces
// ============================================

export interface IQuestion {
    title: string;
    body: string;
    author: Types.ObjectId;
    tags: string[];
    views: number;
    upvotes: Types.ObjectId[];
    downvotes: Types.ObjectId[];
    answers: Types.ObjectId[];
    acceptedAnswer?: Types.ObjectId;
    isClosed: boolean;
    closedReason?: string;
    closedAt?: Date;
    closedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IQuestionDocument extends IQuestion, Document {
    // Virtual: Calculate vote score
    voteScore: number;
    // Virtual: Answer count
    answerCount: number;
}

export interface IQuestionModel extends Model<IQuestionDocument> {
    findByTag(tag: string): Promise<IQuestionDocument[]>;
    searchQuestions(query: string): Promise<IQuestionDocument[]>;
}

// ============================================
// Schema Definition
// ============================================

const QuestionSchema = new Schema<IQuestionDocument, IQuestionModel>(
    {
        title: {
            type: String,
            required: [true, 'Question title is required'],
            trim: true,
            minlength: [15, 'Title must be at least 15 characters'],
            maxlength: [150, 'Title cannot exceed 150 characters'],
        },
        body: {
            type: String,
            required: [true, 'Question body is required'],
            minlength: [30, 'Body must be at least 30 characters'],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author is required'],
        },
        tags: {
            type: [String],
            validate: {
                validator: (tags: string[]) => tags.length >= 1 && tags.length <= 5,
                message: 'Must have 1-5 tags',
            },
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
        },
        upvotes: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        downvotes: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        answers: [{
            type: Schema.Types.ObjectId,
            ref: 'Answer',
        }],
        acceptedAnswer: {
            type: Schema.Types.ObjectId,
            ref: 'Answer',
        },
        isClosed: {
            type: Boolean,
            default: false,
        },
        closedReason: String,
        closedAt: Date,
        closedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
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

QuestionSchema.virtual('voteScore').get(function () {
    return this.upvotes.length - this.downvotes.length;
});

QuestionSchema.virtual('answerCount').get(function () {
    return this.answers.length;
});

// ============================================
// Indexes
// ============================================

QuestionSchema.index({ title: 'text', body: 'text' }); // Text search
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ author: 1 });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ views: -1 });

// ============================================
// Static Methods
// ============================================

QuestionSchema.statics.findByTag = function (tag: string) {
    return this.find({ tags: tag.toLowerCase() })
        .populate('author', 'name avatar reputation')
        .sort({ createdAt: -1 });
};

QuestionSchema.statics.searchQuestions = function (query: string) {
    return this.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
    )
        .populate('author', 'name avatar reputation')
        .sort({ score: { $meta: 'textScore' } });
};

// ============================================
// Model Export
// ============================================

const Question: IQuestionModel =
    (mongoose.models.Question as IQuestionModel) ||
    mongoose.model<IQuestionDocument, IQuestionModel>('Question', QuestionSchema);

export default Question;

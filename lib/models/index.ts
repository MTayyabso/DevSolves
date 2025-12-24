/**
 * Models Index
 * ============
 * Barrel export for all models
 * Import from '@/lib/models' for clean imports
 */

export { default as User } from './User';
export type { IUser, IUserDocument, IUserModel } from './User';

export { default as Question } from './Question';
export type { IQuestion, IQuestionDocument, IQuestionModel } from './Question';

export { default as Answer } from './Answer';
export type { IAnswer, IAnswerDocument, IAnswerModel } from './Answer';

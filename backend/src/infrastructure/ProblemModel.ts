import mongoose, { Schema, Document } from 'mongoose';
import { Problem, RubricItem } from '../domain/Problem';
import { FeedbackDimension, Difficulty } from '../domain/enums';

// ─── Mongoose Document Type ────────────────────────────────────────────────────

export interface ProblemDocument extends Omit<Problem, 'id'>, Document {}

// ─── Schema ───────────────────────────────────────────────────────────────────

const RubricItemSchema = new Schema<RubricItem>(
  {
    dimension: { type: String, enum: Object.values(FeedbackDimension), required: true },
    description: { type: String, required: true },
    weight: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const ProblemSchema = new Schema<ProblemDocument>(
  {
    title: { type: String, required: true },
    prompt: { type: String, required: true },
    constraints: [{ type: String }],
    difficulty: { type: String, enum: Object.values(Difficulty), required: true },
    expectedConcepts: [{ type: String }],
    rubric: [RubricItemSchema],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

export const ProblemModel = mongoose.model<ProblemDocument>('Problem', ProblemSchema);

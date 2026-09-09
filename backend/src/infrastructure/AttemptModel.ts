import mongoose, { Schema, Document } from 'mongoose';
import { Attempt, SubmissionData } from '../domain/Attempt';
import { AttemptStatus, SubmissionType, FeedbackDimension } from '../domain/enums';

// ─── Mongoose Document Type ────────────────────────────────────────────────────

export interface AttemptDocument extends Omit<Attempt, 'id' | 'problem' | 'problemId'>, Document {
  problemId: mongoose.Types.ObjectId;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const DimensionScoreSchema = new Schema(
  {
    dimension: { type: String, enum: Object.values(FeedbackDimension) },
    score: Number,
    maxScore: Number,
    reasoning: String,
  },
  { _id: false },
);

const EvaluationResultSchema = new Schema(
  {
    attemptId: String,
    evaluatorName: String,
    overallScore: Number,
    dimensions: [DimensionScoreSchema],
    summary: String,
    llmUnavailable: Boolean,
    createdAt: Date,
  },
  { _id: false },
);

const SubmissionDataSchema = new Schema<SubmissionData>(
  {
    type: { type: String, enum: Object.values(SubmissionType) },
    content: String,
    language: String,
    diagramText: String,
    format: String,
  },
  { _id: false },
);

const AttemptSchema = new Schema<AttemptDocument>(
  {
    learnerId: { type: String, required: true, index: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(AttemptStatus),
      default: AttemptStatus.DRAFT,
      index: true,
    },
    submissionData: { type: SubmissionDataSchema, default: null },
    evaluationResult: { type: EvaluationResultSchema, default: null },
    failureReason: { type: String, default: null },
    evaluationLock: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    evaluatedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

// Compound index: learnerId + problemId for history queries
AttemptSchema.index({ learnerId: 1, problemId: 1 });
// For worker: find submitted/failed attempts to evaluate
AttemptSchema.index({ status: 1, submittedAt: 1 });

export const AttemptModel = mongoose.model<AttemptDocument>('Attempt', AttemptSchema);

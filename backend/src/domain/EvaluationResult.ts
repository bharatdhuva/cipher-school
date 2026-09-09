import { FeedbackDimension } from './enums';

// ─── Value Objects ─────────────────────────────────────────────────────────────

export interface DimensionScore {
  dimension: FeedbackDimension;
  score: number;     // 0–10
  maxScore: number;  // always 10
  reasoning: string; // 1-2 sentence explanation — never empty
}

// ─── EvaluationResult Value Object ────────────────────────────────────────────

export interface EvaluationResult {
  attemptId: string;
  evaluatorName: string; // 'deterministic' | 'llm' | 'deterministic+llm'
  overallScore: number;  // weighted average of dimension scores, 0–10
  dimensions: DimensionScore[];
  summary: string;       // 2-3 sentence human-readable summary
  llmUnavailable?: boolean; // true if fell back to deterministic-only
  createdAt: Date;
}

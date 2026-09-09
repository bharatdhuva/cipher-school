import { SubmissionType } from '../enums';

// ─── ValidationResult ─────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ─── SubmissionFormat Interface (Strategy / Open-Closed seam) ─────────────────
//
// EXTENSIBILITY PROOF:
//   Adding a new submission format (e.g. Excalidraw JSON) requires ONLY:
//     1. Create a new file implementing this interface
//     2. Register it in SubmissionFormatRegistry
//   Attempt, EvaluationStrategy, and all API routes need ZERO changes.

export interface SubmissionFormat {
  readonly type: SubmissionType;
  validate(): ValidationResult;
  render(): string; // normalised string fed to evaluators
}

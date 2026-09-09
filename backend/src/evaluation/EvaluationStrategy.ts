import { Attempt } from '../domain/Attempt';
import { EvaluationResult } from '../domain/EvaluationResult';

// ─── EvaluationStrategy Interface (Strategy Pattern) ──────────────────────────
//
// EXTENSIBILITY PROOF:
//   Adding a new evaluator (e.g. a static-analysis linter) requires ONLY:
//     1. Create a class implementing this interface
//     2. Register it in EvaluatorRegistry
//   The Attempt state machine, AttemptService, and all routes need ZERO changes.

export interface EvaluationStrategy {
  readonly name: string;
  evaluate(attempt: Attempt): Promise<EvaluationResult>;
}

import { AttemptStatus, SubmissionType } from './enums';
import { Problem } from './Problem';
import { EvaluationResult } from './EvaluationResult';

// ─── Attempt Aggregate ─────────────────────────────────────────────────────────
//
// The Attempt is the central aggregate that owns the practice session lifecycle.
// It does NOT know how evaluation works — it only exposes state-transition methods
// that services call. This keeps domain logic pure and unit-testable without a DB.
//
// State Machine:
//   DRAFT → SUBMITTED → EVALUATING → EVALUATED
//                                  ↘ FAILED → EVALUATING (retry)

export interface SubmissionData {
  type: SubmissionType;
  content?: string;
  language?: string;
  diagramText?: string;
  format?: string;
}

export interface Attempt {
  id: string;
  learnerId: string;        // UUID from localStorage — no auth required
  problem: Problem;
  problemId: string;
  status: AttemptStatus;
  submissionData: SubmissionData | null;
  evaluationResult: EvaluationResult | null;
  failureReason: string | null;
  evaluationLock: Date | null; // prevents double-evaluation on retry
  createdAt: Date;
  submittedAt: Date | null;
  evaluatedAt: Date | null;
}

// ─── State Transition Helpers (pure functions, no side-effects) ────────────────

export type AttemptTransition =
  | { type: 'SUBMIT'; submissionData: SubmissionData }
  | { type: 'MARK_EVALUATING'; lockAt: Date }
  | { type: 'MARK_EVALUATED'; result: EvaluationResult; at: Date }
  | { type: 'MARK_FAILED'; reason: string };

/**
 * Pure state-transition function. Returns a new Attempt object — does not mutate.
 * Throws if the transition is illegal for the current status.
 */
export function applyAttemptTransition(attempt: Attempt, transition: AttemptTransition): Attempt {
  switch (transition.type) {
    case 'SUBMIT': {
      if (attempt.status !== AttemptStatus.DRAFT) {
        throw new Error(
          `Cannot submit: Attempt is in status "${attempt.status}", expected "draft".`,
        );
      }
      return {
        ...attempt,
        status: AttemptStatus.SUBMITTED,
        submissionData: transition.submissionData,
        submittedAt: new Date(),
      };
    }

    case 'MARK_EVALUATING': {
      if (
        attempt.status !== AttemptStatus.SUBMITTED &&
        attempt.status !== AttemptStatus.FAILED
      ) {
        throw new Error(
          `Cannot start evaluation: Attempt is in status "${attempt.status}", ` +
          `expected "submitted" or "failed".`,
        );
      }
      return {
        ...attempt,
        status: AttemptStatus.EVALUATING,
        evaluationLock: transition.lockAt,
        failureReason: null, // clear previous failure on retry
      };
    }

    case 'MARK_EVALUATED': {
      if (attempt.status !== AttemptStatus.EVALUATING) {
        throw new Error(
          `Cannot mark evaluated: Attempt is in status "${attempt.status}", expected "evaluating".`,
        );
      }
      return {
        ...attempt,
        status: AttemptStatus.EVALUATED,
        evaluationResult: transition.result,
        evaluationLock: null,
        evaluatedAt: transition.at,
      };
    }

    case 'MARK_FAILED': {
      if (attempt.status !== AttemptStatus.EVALUATING) {
        throw new Error(
          `Cannot mark failed: Attempt is in status "${attempt.status}", expected "evaluating".`,
        );
      }
      return {
        ...attempt,
        status: AttemptStatus.FAILED,
        failureReason: transition.reason,
        evaluationLock: null,
      };
    }

    default: {
      const _exhaustive: never = transition;
      throw new Error(`Unknown transition: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

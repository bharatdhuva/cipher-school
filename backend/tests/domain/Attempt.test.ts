import {
  Attempt,
  applyAttemptTransition,
  SubmissionData,
} from '../../src/domain/Attempt';
import { AttemptStatus, SubmissionType, Difficulty } from '../../src/domain/enums';
import { Problem } from '../../src/domain/Problem';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockProblem: Problem = {
  id: 'prob-1',
  title: 'Parking Lot',
  prompt: 'Design a parking lot...',
  constraints: [],
  difficulty: Difficulty.MEDIUM,
  expectedConcepts: ['strategy', 'interface'],
  rubric: [],
  createdAt: new Date(),
};

const baseAttempt: Attempt = {
  id: 'att-1',
  learnerId: 'learner-uuid',
  problem: mockProblem,
  problemId: 'prob-1',
  status: AttemptStatus.DRAFT,
  submissionData: null,
  evaluationResult: null,
  failureReason: null,
  evaluationLock: null,
  createdAt: new Date(),
  submittedAt: null,
  evaluatedAt: null,
};

const mockSubmission: SubmissionData = {
  type: SubmissionType.TEXT,
  content: 'I would design a ParkingLot class with a Strategy pattern for fee calculation...',
};

// ─── State Machine Tests ───────────────────────────────────────────────────────

describe('Attempt State Machine', () => {
  describe('DRAFT → SUBMITTED', () => {
    it('transitions successfully with valid submission', () => {
      const result = applyAttemptTransition(baseAttempt, {
        type: 'SUBMIT',
        submissionData: mockSubmission,
      });
      expect(result.status).toBe(AttemptStatus.SUBMITTED);
      expect(result.submissionData).toEqual(mockSubmission);
      expect(result.submittedAt).toBeInstanceOf(Date);
    });

    it('throws when attempt is not in DRAFT status', () => {
      const submitted = { ...baseAttempt, status: AttemptStatus.SUBMITTED };
      expect(() =>
        applyAttemptTransition(submitted, { type: 'SUBMIT', submissionData: mockSubmission }),
      ).toThrow(/Cannot submit/);
    });
  });

  describe('SUBMITTED → EVALUATING', () => {
    const submitted: Attempt = {
      ...baseAttempt,
      status: AttemptStatus.SUBMITTED,
      submissionData: mockSubmission,
      submittedAt: new Date(),
    };

    it('transitions to EVALUATING and sets lock', () => {
      const lockAt = new Date();
      const result = applyAttemptTransition(submitted, { type: 'MARK_EVALUATING', lockAt });
      expect(result.status).toBe(AttemptStatus.EVALUATING);
      expect(result.evaluationLock).toEqual(lockAt);
    });

    it('clears previous failureReason on retry', () => {
      const failed: Attempt = {
        ...submitted,
        status: AttemptStatus.FAILED,
        failureReason: 'Previous failure',
      };
      const result = applyAttemptTransition(failed, {
        type: 'MARK_EVALUATING',
        lockAt: new Date(),
      });
      expect(result.failureReason).toBeNull();
    });
  });

  describe('EVALUATING → EVALUATED', () => {
    const evaluating: Attempt = {
      ...baseAttempt,
      status: AttemptStatus.EVALUATING,
      submissionData: mockSubmission,
      evaluationLock: new Date(),
    };

    it('transitions to EVALUATED with result', () => {
      const mockResult = {
        attemptId: 'att-1',
        evaluatorName: 'deterministic',
        overallScore: 7.5,
        dimensions: [],
        summary: 'Good attempt.',
        createdAt: new Date(),
      };
      const result = applyAttemptTransition(evaluating, {
        type: 'MARK_EVALUATED',
        result: mockResult,
        at: new Date(),
      });
      expect(result.status).toBe(AttemptStatus.EVALUATED);
      expect(result.evaluationResult).toEqual(mockResult);
      expect(result.evaluationLock).toBeNull();
    });

    it('throws when attempt is not EVALUATING', () => {
      expect(() =>
        applyAttemptTransition(baseAttempt, {
          type: 'MARK_EVALUATED',
          result: {} as any,
          at: new Date(),
        }),
      ).toThrow(/Cannot mark evaluated/);
    });
  });

  describe('EVALUATING → FAILED', () => {
    const evaluating: Attempt = {
      ...baseAttempt,
      status: AttemptStatus.EVALUATING,
      evaluationLock: new Date(),
    };

    it('transitions to FAILED with reason', () => {
      const result = applyAttemptTransition(evaluating, {
        type: 'MARK_FAILED',
        reason: 'LLM timeout',
      });
      expect(result.status).toBe(AttemptStatus.FAILED);
      expect(result.failureReason).toBe('LLM timeout');
      expect(result.evaluationLock).toBeNull();
    });

    it('throws when attempt is not EVALUATING', () => {
      expect(() =>
        applyAttemptTransition(baseAttempt, { type: 'MARK_FAILED', reason: 'error' }),
      ).toThrow(/Cannot mark failed/);
    });
  });

  describe('Immutability', () => {
    it('does not mutate the original attempt', () => {
      const original = { ...baseAttempt };
      applyAttemptTransition(baseAttempt, { type: 'SUBMIT', submissionData: mockSubmission });
      expect(baseAttempt.status).toBe(original.status);
      expect(baseAttempt.submittedAt).toBe(original.submittedAt);
    });
  });
});

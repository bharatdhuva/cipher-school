import { DeterministicEvaluator } from '../../src/evaluation/DeterministicEvaluator';
import { Attempt } from '../../src/domain/Attempt';
import { AttemptStatus, SubmissionType, Difficulty, FeedbackDimension } from '../../src/domain/enums';
import { Problem } from '../../src/domain/Problem';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockProblem: Problem = {
  id: 'prob-1',
  title: 'Parking Lot',
  prompt: 'Design a parking lot...',
  constraints: [],
  difficulty: Difficulty.MEDIUM,
  expectedConcepts: ['strategy', 'interface', 'abstract', 'vehicle', 'spot'],
  rubric: [],
  createdAt: new Date(),
};

function makeAttempt(content: string, type: SubmissionType = SubmissionType.TEXT): Attempt {
  return {
    id: 'att-1',
    learnerId: 'learner-1',
    problem: mockProblem,
    problemId: 'prob-1',
    status: AttemptStatus.SUBMITTED,
    submissionData: { type, content },
    evaluationResult: null,
    failureReason: null,
    evaluationLock: null,
    createdAt: new Date(),
    submittedAt: new Date(),
    evaluatedAt: null,
  };
}

const evaluator = new DeterministicEvaluator();

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('DeterministicEvaluator', () => {
  it('returns a result with 6 dimension scores', async () => {
    const attempt = makeAttempt(
      'I will use the Strategy pattern. Abstract class Vehicle with Car and Truck implementations. Interface for fee calculation. SRP applied to each class.',
    );
    const result = await evaluator.evaluate(attempt);
    expect(result.dimensions).toHaveLength(6);
    expect(result.evaluatorName).toBe('deterministic');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(10);
  });

  it('gives low abstraction score for submission with no interface keywords', async () => {
    const attempt = makeAttempt('The parking lot has a manager. The manager parks cars.');
    const result = await evaluator.evaluate(attempt);
    const abstraction = result.dimensions.find(
      (d) => d.dimension === FeedbackDimension.ABSTRACTION_QUALITY,
    );
    expect(abstraction?.score).toBeLessThan(5);
  });

  it('gives high extensibility score when strategy and ocp are mentioned', async () => {
    const attempt = makeAttempt(
      'Using Strategy pattern for fee calculation. The system is extensible via OCP — new vehicle types can be added by implementing the Vehicle interface.',
    );
    const result = await evaluator.evaluate(attempt);
    const ext = result.dimensions.find((d) => d.dimension === FeedbackDimension.EXTENSIBILITY);
    expect(ext?.score).toBeGreaterThanOrEqual(6);
  });

  it('matches expected concepts from problem rubric', async () => {
    const attempt = makeAttempt(
      'I will define an interface for Vehicle. Strategy pattern for payment. Abstract class for spot.',
    );
    const result = await evaluator.evaluate(attempt);
    const pattern = result.dimensions.find(
      (d) => d.dimension === FeedbackDimension.PATTERN_CORRECTNESS,
    );
    expect(pattern?.score).toBeGreaterThan(3);
  });

  it('handles empty submission gracefully', async () => {
    const attempt = makeAttempt('');
    const result = await evaluator.evaluate(attempt);
    // Should not throw; should return a result
    expect(result).toBeDefined();
    expect(result.evaluatorName).toBe('deterministic');
  });

  it('handles null submissionData gracefully', async () => {
    const attempt: Attempt = {
      id: 'att-null',
      learnerId: 'learner-1',
      problem: mockProblem,
      problemId: 'prob-1',
      status: AttemptStatus.SUBMITTED,
      submissionData: null,
      evaluationResult: null,
      failureReason: null,
      evaluationLock: null,
      createdAt: new Date(),
      submittedAt: new Date(),
      evaluatedAt: null,
    };
    const result = await evaluator.evaluate(attempt);
    expect(result.overallScore).toBe(0);
  });

  it('returns all dimension scores with reasoning strings', async () => {
    const attempt = makeAttempt('The ParkingLot uses a Strategy interface for fee calculation. SRP is maintained. OCP is respected.');
    const result = await evaluator.evaluate(attempt);
    for (const dim of result.dimensions) {
      expect(dim.reasoning).toBeTruthy();
      expect(dim.reasoning.length).toBeGreaterThan(10);
    }
  });
});

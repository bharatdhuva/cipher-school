import { AttemptRepository } from '../infrastructure/AttemptRepository';
import { ProblemRepository } from '../infrastructure/ProblemRepository';
import { applyAttemptTransition, SubmissionData } from '../domain/Attempt';
import { SubmissionFormatFactory } from '../domain/submission/SubmissionFormatFactory';
import { SubmissionType, AttemptStatus } from '../domain/enums';

// ─── AttemptService ────────────────────────────────────────────────────────────
// Orchestrates the attempt lifecycle. Does not touch Mongoose directly.

export const AttemptService = {

  async createAttempt(learnerId: string, problemId: string) {
    const problem = await ProblemRepository.findById(problemId);
    if (!problem) throw new Error(`Problem not found: ${problemId}`);
    return AttemptRepository.create(learnerId, problemId);
  },

  async submitAttempt(attemptId: string, learnerId: string, payload: SubmissionData) {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt) throw new Error(`Attempt not found: ${attemptId}`);
    if (attempt.learnerId !== learnerId) throw new Error('Not authorised to submit this attempt.');

    // Validate submission format before transitioning
    const format = SubmissionFormatFactory.create(payload as any);
    const validation = format.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid submission: ${validation.errors.join('; ')}`);
    }

    const updated = applyAttemptTransition(attempt, {
      type: 'SUBMIT',
      submissionData: payload,
    });

    return AttemptRepository.save(updated);
  },

  async getAttempt(attemptId: string) {
    return AttemptRepository.findById(attemptId);
  },

  async getHistory(learnerId: string, problemId: string) {
    return AttemptRepository.findByLearnerAndProblem(learnerId, problemId);
  },

  async getAllAttempts(learnerId: string) {
    return AttemptRepository.findByLearnerId(learnerId);
  },
};

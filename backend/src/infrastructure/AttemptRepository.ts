import { AttemptModel } from './AttemptModel';
import { Attempt } from '../domain/Attempt';
import { AttemptStatus } from '../domain/enums';
import { ProblemRepository } from './ProblemRepository';

// ─── AttemptRepository ─────────────────────────────────────────────────────────

async function toPlain(doc: any): Promise<Attempt> {
  const problem = await ProblemRepository.findById(doc.problemId.toString());
  return {
    id: doc._id.toString(),
    learnerId: doc.learnerId,
    problem: problem!,
    problemId: doc.problemId.toString(),
    status: doc.status,
    submissionData: doc.submissionData ?? null,
    evaluationResult: doc.evaluationResult ?? null,
    failureReason: doc.failureReason ?? null,
    evaluationLock: doc.evaluationLock ?? null,
    createdAt: doc.createdAt,
    submittedAt: doc.submittedAt ?? null,
    evaluatedAt: doc.evaluatedAt ?? null,
  };
}

export const AttemptRepository = {
  async create(learnerId: string, problemId: string): Promise<Attempt> {
    const doc = await AttemptModel.create({ learnerId, problemId });
    return toPlain(doc);
  },

  async findById(id: string): Promise<Attempt | null> {
    try {
      const doc = await AttemptModel.findById(id).lean();
      return doc ? toPlain(doc) : null;
    } catch {
      return null;
    }
  },

  async save(attempt: Attempt): Promise<Attempt> {
    const updated = await AttemptModel.findByIdAndUpdate(
      attempt.id,
      {
        status: attempt.status,
        submissionData: attempt.submissionData,
        evaluationResult: attempt.evaluationResult,
        failureReason: attempt.failureReason,
        evaluationLock: attempt.evaluationLock,
        submittedAt: attempt.submittedAt,
        evaluatedAt: attempt.evaluatedAt,
      },
      { new: true, lean: true },
    );
    return toPlain(updated);
  },

  async findByLearnerAndProblem(learnerId: string, problemId: string): Promise<Attempt[]> {
    const docs = await AttemptModel.find({ learnerId, problemId })
      .sort({ createdAt: -1 })
      .lean();
    return Promise.all(docs.map(toPlain));
  },

  async findByLearnerId(learnerId: string): Promise<Attempt[]> {
    const docs = await AttemptModel.find({ learnerId }).sort({ createdAt: -1 }).lean();
    return Promise.all(docs.map(toPlain));
  },

  /** Used by EvaluationWorker to pick up work. */
  async findPendingEvaluation(limit = 10): Promise<Attempt[]> {
    const statuses = [AttemptStatus.SUBMITTED, AttemptStatus.FAILED];
    const docs = await AttemptModel.find({
      status: { $in: statuses },
      evaluationLock: null,
    })
      .sort({ submittedAt: 1 })
      .limit(limit)
      .lean();
    return Promise.all(docs.map(toPlain));
  },
};

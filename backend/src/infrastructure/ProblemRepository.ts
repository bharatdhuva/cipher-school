import { ProblemModel } from './ProblemModel';
import { Problem } from '../domain/Problem';

// ─── ProblemRepository ─────────────────────────────────────────────────────────
// Mongoose stays in this file. Domain services receive plain Problem objects.

function toPlain(doc: any): Problem {
  return {
    id: doc._id.toString(),
    title: doc.title,
    prompt: doc.prompt,
    constraints: doc.constraints ?? [],
    difficulty: doc.difficulty,
    expectedConcepts: doc.expectedConcepts ?? [],
    rubric: doc.rubric ?? [],
    createdAt: doc.createdAt,
  };
}

export const ProblemRepository = {
  async findAll(): Promise<Problem[]> {
    const docs = await ProblemModel.find().sort({ createdAt: 1 }).lean();
    return docs.map(toPlain);
  },

  async findById(id: string): Promise<Problem | null> {
    try {
      const doc = await ProblemModel.findById(id).lean();
      return doc ? toPlain(doc) : null;
    } catch {
      return null;
    }
  },
};

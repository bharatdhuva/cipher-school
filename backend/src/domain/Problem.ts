import { FeedbackDimension, Difficulty } from './enums';

// ─── Value Objects ─────────────────────────────────────────────────────────────

export interface RubricItem {
  dimension: FeedbackDimension;
  description: string;
  weight: number; // 0–1, all weights in a Problem sum to 1
}

// ─── Problem Entity ────────────────────────────────────────────────────────────

export interface Problem {
  id: string;
  title: string;
  prompt: string;
  constraints: string[];
  difficulty: Difficulty;
  expectedConcepts: string[]; // e.g. ['Strategy', 'SRP', 'Factory']
  rubric: RubricItem[];
  createdAt: Date;
}

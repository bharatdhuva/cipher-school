// ── API Client ───────────────────────────────────────────────────────────────
// All fetch calls go through this file. Keeps components clean.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RubricItem {
  dimension: string;
  description: string;
  weight: number;
}

export interface Problem {
  id: string;
  title: string;
  prompt: string;
  constraints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  expectedConcepts: string[];
  rubric: RubricItem[];
  createdAt: string;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  reasoning: string;
}

export interface EvaluationResult {
  attemptId: string;
  evaluatorName: string;
  overallScore: number;
  dimensions: DimensionScore[];
  summary: string;
  llmUnavailable?: boolean;
  createdAt: string;
}

export interface Attempt {
  id: string;
  learnerId: string;
  problemId: string;
  status: 'draft' | 'submitted' | 'evaluating' | 'evaluated' | 'failed';
  submissionData: { type: string; content?: string; language?: string; diagramText?: string } | null;
  evaluationResult: EvaluationResult | null;
  failureReason: string | null;
  createdAt: string;
  submittedAt: string | null;
  evaluatedAt: string | null;
}

export interface SubmissionPayload {
  type: 'text' | 'code' | 'diagram';
  content?: string;
  language?: string;
  diagramText?: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export const api = {
  getProblems: () => request<{ problems: Problem[] }>('/api/problems'),
  getProblem: (id: string) => request<{ problem: Problem }>(`/api/problems/${id}`),

  createAttempt: (learnerId: string, problemId: string) =>
    request<{ attempt: Attempt }>('/api/attempts', {
      method: 'POST',
      body: JSON.stringify({ learnerId, problemId }),
    }),

  submitAttempt: (attemptId: string, learnerId: string, submission: SubmissionPayload) =>
    request<{ attempt: Attempt }>(`/api/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ learnerId, submission }),
    }),

  getAttempt: (id: string) => request<{ attempt: Attempt }>(`/api/attempts/${id}`),

  getHistory: (learnerId: string, problemId: string) =>
    request<{ attempts: Attempt[] }>(`/api/attempts?learnerId=${learnerId}&problemId=${problemId}`),
};

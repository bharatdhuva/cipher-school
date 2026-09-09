import OpenAI from 'openai';
import { EvaluationStrategy } from './EvaluationStrategy';
import { Attempt } from '../domain/Attempt';
import { EvaluationResult, DimensionScore } from '../domain/EvaluationResult';
import { FeedbackDimension } from '../domain/enums';
import { DeterministicEvaluator } from './DeterministicEvaluator';

const DIMENSION_LABELS: Record<FeedbackDimension, string> = {
  [FeedbackDimension.RESPONSIBILITY_ASSIGNMENT]: 'Responsibility Assignment',
  [FeedbackDimension.ABSTRACTION_QUALITY]: 'Abstraction Quality',
  [FeedbackDimension.EXTENSIBILITY]: 'Extensibility',
  [FeedbackDimension.SOLID_ADHERENCE]: 'SOLID Adherence',
  [FeedbackDimension.PATTERN_CORRECTNESS]: 'Pattern Correctness',
  [FeedbackDimension.NAMING_CLARITY]: 'Naming Clarity',
};

// ─── LLMEvaluator ──────────────────────────────────────────────────────────────
//
// Reasoning-heavy evaluation tier. Runs AFTER deterministic checks pass sanity.
// Uses structured JSON output from GPT-4o-mini.
// Falls back gracefully — caller (AttemptService) handles timeout/failure.

export class LLMEvaluator implements EvaluationStrategy {
  readonly name = 'llm';
  private client: OpenAI | null = null;
  private modelName = 'gpt-4o-mini';
  private deterministicEvaluator = new DeterministicEvaluator();

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    if (geminiKey && geminiKey.length > 0) {
      this.client = new OpenAI({
        apiKey: geminiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      });
      this.modelName = 'gemini-2.5-flash';
    } else if (openAIKey && openAIKey.length > 0) {
      this.client = new OpenAI({ apiKey: openAIKey });
      this.modelName = 'gpt-4o-mini';
    }
    // If neither key is provided, client stays null; worker gracefully catches and falls back to deterministic.
  }

  async evaluate(attempt: Attempt): Promise<EvaluationResult> {
    if (!this.client) {
      throw new Error('LLM evaluator unavailable: Neither GEMINI_API_KEY nor OPENAI_API_KEY is set.');
    }
    if (!attempt.submissionData) {
      throw new Error('No submission data for LLM evaluation.');
    }

    const rendered = this.renderSubmission(attempt);
    const prompt = this.buildPrompt(attempt, rendered);

    const response = await this.client.chat.completions.create({
      model: this.modelName,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert Low-Level Design (LLD) interviewer at a top tech company.
Your task is to evaluate a candidate's LLD solution and provide structured, actionable feedback.
Always return valid JSON matching the exact schema requested. Be honest and specific — never generic.`,
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    return this.parseResponse(raw, attempt.id);
  }

  // ─── Private: Prompt ───────────────────────────────────────────────────────

  private buildPrompt(attempt: Attempt, rendered: string): string {
    const problem = attempt.problem;
    const rubricText = (problem?.rubric ?? [])
      .map((r) => `- ${DIMENSION_LABELS[r.dimension]} (weight ${r.weight}): ${r.description}`)
      .join('\n');

    const expectedConcepts = (problem?.expectedConcepts ?? []).join(', ');
    const dimensions = Object.values(FeedbackDimension);

    return `
## LLD Problem
Title: ${problem?.title ?? 'Unknown'}
Difficulty: ${problem?.difficulty ?? 'medium'}

Problem Prompt:
${problem?.prompt ?? ''}

Constraints:
${(problem?.constraints ?? []).map((c) => `- ${c}`).join('\n')}

Expected Concepts (the candidate should address these):
${expectedConcepts}

## Evaluation Rubric
${rubricText || 'Evaluate equally across all dimensions.'}

## Candidate Submission
${rendered}

## Your Task
Evaluate the submission across ALL of these dimensions:
${dimensions.map((d) => `- ${d}: ${DIMENSION_LABELS[d]}`).join('\n')}

For each dimension:
1. Give a score from 0 to 10 (be calibrated — 5 is average, 8+ is excellent)
2. Write 1-2 specific sentences explaining your score (reference actual content from the submission)
3. Do NOT give generic feedback — always tie reasoning to what the candidate actually wrote

Then compute a weighted overall score based on the rubric weights (if none, use equal weights).
Write a 2-3 sentence summary.

Return ONLY valid JSON with this exact schema:
{
  "dimensions": [
    {
      "dimension": "<FeedbackDimension enum value>",
      "score": <number 0-10>,
      "maxScore": 10,
      "reasoning": "<1-2 specific sentences>"
    }
  ],
  "overallScore": <number 0-10, one decimal>,
  "summary": "<2-3 sentence summary>"
}

Valid dimension enum values: ${dimensions.join(', ')}
`.trim();
  }

  // ─── Private: Parse ────────────────────────────────────────────────────────

  private parseResponse(raw: string, attemptId: string): EvaluationResult {
    let parsed: { dimensions?: DimensionScore[]; overallScore?: number; summary?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`LLM returned non-JSON response: ${raw.slice(0, 200)}`);
    }

    if (!parsed.dimensions || !Array.isArray(parsed.dimensions)) {
      throw new Error('LLM response missing required "dimensions" array.');
    }

    return {
      attemptId,
      evaluatorName: this.name,
      overallScore: parsed.overallScore ?? 0,
      dimensions: parsed.dimensions,
      summary: parsed.summary ?? 'AI evaluation completed.',
      llmUnavailable: false,
      createdAt: new Date(),
    };
  }

  private renderSubmission(attempt: Attempt): string {
    const data = attempt.submissionData!;
    switch (data.type) {
      case 'text': return data.content ?? '';
      case 'code': return `Language: ${data.language}\n\`\`\`\n${data.content}\n\`\`\``;
      case 'diagram': return `[Mermaid Diagram]\n\`\`\`mermaid\n${data.diagramText}\n\`\`\``;
      default: return '';
    }
  }
}

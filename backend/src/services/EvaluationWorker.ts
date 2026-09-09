import { AttemptRepository } from '../infrastructure/AttemptRepository';
import { applyAttemptTransition } from '../domain/Attempt';
import { EvaluatorRegistry } from '../evaluation/EvaluatorRegistry';
import { DeterministicEvaluator } from '../evaluation/DeterministicEvaluator';
import { AttemptStatus } from '../domain/enums';

const LOCK_TIMEOUT_MS = 60_000; // 60s — stale locks released after this

// ─── EvaluationWorker ──────────────────────────────────────────────────────────
//
// A simple in-process polling loop. Picks up SUBMITTED or FAILED attempts,
// locks them (prevents double-evaluation), runs deterministic + LLM evaluation,
// then writes the result.
//
// Design answers question #5: "What happens if evaluation takes time or fails?"
// - Attempt moves to EVALUATING immediately (no blocking HTTP wait)
// - FAILED is a first-class state — retried on next poll cycle
// - LLM failure falls back to deterministic-only with llmUnavailable: true

class EvaluationWorkerClass {
  private interval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private deterministicEvaluator = new DeterministicEvaluator();

  start(intervalMs = 3000): void {
    if (this.interval) return; // already running
    console.log(`[Worker] EvaluationWorker started (poll every ${intervalMs}ms)`);
    this.interval = setInterval(() => this.poll(), intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('[Worker] EvaluationWorker stopped');
    }
  }

  private async poll(): Promise<void> {
    if (this.isRunning) return; // prevent overlapping runs
    this.isRunning = true;
    try {
      const pending = await AttemptRepository.findPendingEvaluation(5);
      for (const attempt of pending) {
        await this.processAttempt(attempt);
      }
    } catch (err) {
      console.error('[Worker] Poll error:', err);
    } finally {
      this.isRunning = false;
    }
  }

  private async processAttempt(attempt: any): Promise<void> {
    try {
      // Lock the attempt
      const locked = applyAttemptTransition(attempt, {
        type: 'MARK_EVALUATING',
        lockAt: new Date(),
      });
      await AttemptRepository.save(locked);

      // ── Tier 1: Deterministic (always runs) ─────────────────────────────
      const deterministicResult = await this.deterministicEvaluator.evaluate(locked);

      // ── Tier 2: LLM (runs after deterministic) ──────────────────────────
      let finalResult = { ...deterministicResult, evaluatorName: 'deterministic' };
      let llmUnavailable = false;

      const llmEvaluator = EvaluatorRegistry.get('llm');
      const hasAIKey = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0) ||
                       (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');

      if (llmEvaluator && hasAIKey) {
        try {
          const llmResult = await Promise.race([
            llmEvaluator.evaluate(locked),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('LLM evaluation timeout')), 30_000),
            ),
          ]);
          finalResult = { ...llmResult as any, evaluatorName: 'deterministic+llm' };
        } catch (llmErr) {
          console.warn('[Worker] LLM evaluation failed, falling back to deterministic:', llmErr);
          llmUnavailable = true;
          finalResult = { ...deterministicResult, evaluatorName: 'deterministic', llmUnavailable: true };
        }
      } else {
        console.info('[Worker] No valid GEMINI_API_KEY or OPENAI_API_KEY — using deterministic-only evaluation.');
        llmUnavailable = true;
        finalResult = { ...deterministicResult, llmUnavailable: true };
      }

      // ── Mark evaluated ───────────────────────────────────────────────────
      const evaluated = applyAttemptTransition(locked, {
        type: 'MARK_EVALUATED',
        result: finalResult,
        at: new Date(),
      });
      await AttemptRepository.save(evaluated);
      console.log(`[Worker] Attempt ${attempt.id} evaluated (${finalResult.evaluatorName}), score=${finalResult.overallScore}`);

    } catch (err: any) {
      console.error(`[Worker] Failed to evaluate attempt ${attempt.id}:`, err);
      try {
        const refetch = await AttemptRepository.findById(attempt.id);
        if (refetch && refetch.status === AttemptStatus.EVALUATING) {
          const failed = applyAttemptTransition(refetch, {
            type: 'MARK_FAILED',
            reason: err?.message ?? 'Evaluation failed',
          });
          await AttemptRepository.save(failed);
        }
      } catch (saveErr) {
        console.error('[Worker] Could not mark attempt as FAILED:', saveErr);
      }
    }
  }
}

export const EvaluationWorker = new EvaluationWorkerClass();

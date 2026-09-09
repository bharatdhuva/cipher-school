import { EvaluationStrategy } from './EvaluationStrategy';
import { DeterministicEvaluator } from './DeterministicEvaluator';
import { LLMEvaluator } from './LLMEvaluator';

// ─── EvaluatorRegistry ─────────────────────────────────────────────────────────
//
// EXTENSIBILITY PROOF:
//   To add a new evaluator (e.g. a linter-based static analyser):
//   1. Create a class implementing EvaluationStrategy
//   2. Call EvaluatorRegistry.register(new MyLinterEvaluator())
//   No other files need to change.

class EvaluatorRegistry {
  private strategies = new Map<string, EvaluationStrategy>();

  register(strategy: EvaluationStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  get(name: string): EvaluationStrategy | undefined {
    return this.strategies.get(name);
  }

  getAll(): EvaluationStrategy[] {
    return Array.from(this.strategies.values());
  }
}

// Singleton registry wired with the two built-in strategies
const registry = new EvaluatorRegistry();
registry.register(new DeterministicEvaluator());
registry.register(new LLMEvaluator());

export { registry as EvaluatorRegistry };
export type { EvaluationStrategy };

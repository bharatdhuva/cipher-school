import { EvaluationStrategy } from './EvaluationStrategy';
import { Attempt } from '../domain/Attempt';
import { EvaluationResult, DimensionScore } from '../domain/EvaluationResult';
import { FeedbackDimension } from '../domain/enums';

// ─── Structural Rule Types ─────────────────────────────────────────────────────

interface StructuralRule {
  dimension: FeedbackDimension;
  description: string;
  check: (rendered: string) => { passed: boolean; reasoning: string; score: number };
}

// ─── DeterministicEvaluator ────────────────────────────────────────────────────
//
// Fast, free, always runs first. No external calls.
// Uses heuristic pattern-matching on rendered submission text.
// Not a perfect static analyser — but reliably catches the most common LLD
// anti-patterns and signals (presence of classes, interfaces, abstractions, etc.)

export class DeterministicEvaluator implements EvaluationStrategy {
  readonly name = 'deterministic';

  evaluate(attempt: Attempt): Promise<EvaluationResult> {
    if (!attempt.submissionData) {
      return Promise.resolve(this.buildEmptyResult(attempt.id, 'No submission data found.'));
    }

    const rendered = this.renderSubmission(attempt);
    const rules = this.buildRules(attempt);
    const dimensionScores: DimensionScore[] = rules.map((rule) => {
      const { passed, reasoning, score } = rule.check(rendered);
      return {
        dimension: rule.dimension,
        score: passed ? score : Math.floor(score * 0.3), // partial credit for partial compliance
        maxScore: 10,
        reasoning,
      };
    });

    // Weight by problem rubric if available, else equal weight
    const overallScore = this.computeOverallScore(dimensionScores, attempt);
    const summary = this.buildSummary(dimensionScores, overallScore);

    const result: EvaluationResult = {
      attemptId: attempt.id,
      evaluatorName: this.name,
      overallScore,
      dimensions: dimensionScores,
      summary,
      llmUnavailable: false,
      createdAt: new Date(),
    };

    return Promise.resolve(result);
  }

  // ─── Private: Render ────────────────────────────────────────────────────────

  private renderSubmission(attempt: Attempt): string {
    const data = attempt.submissionData!;
    switch (data.type) {
      case 'text':
        return (data.content ?? '').toLowerCase();
      case 'code':
        return (data.content ?? '').toLowerCase();
      case 'diagram':
        return (data.diagramText ?? '').toLowerCase();
      default:
        return '';
    }
  }

  // ─── Private: Rules ─────────────────────────────────────────────────────────

  private buildRules(attempt: Attempt): StructuralRule[] {
    const isCode = attempt.submissionData?.type === 'code';

    return [
      // 1. RESPONSIBILITY_ASSIGNMENT — are there distinct class names?
      {
        dimension: FeedbackDimension.RESPONSIBILITY_ASSIGNMENT,
        description: 'Checks that multiple distinct classes/entities are defined.',
        check: (text: string) => {
          const classPatterns = isCode
            ? (text.match(/\bclass\s+\w+/g) ?? [])
            : (text.match(/\b(class|entity|component|service|manager|handler|controller|repository|factory|interface)\b/g) ?? []);
          const count = new Set(classPatterns).size;
          if (count >= 4) return { passed: true, score: 9, reasoning: `Found ${count} distinct class/entity references — good separation of responsibilities.` };
          if (count >= 2) return { passed: true, score: 6, reasoning: `Found ${count} class/entity references — some responsibility separation, but consider splitting further.` };
          return { passed: false, score: 3, reasoning: `Only ${count} class/entity reference(s) found. A well-designed LLD solution should define multiple distinct responsibilities.` };
        },
      },

      // 2. ABSTRACTION_QUALITY — are interfaces / abstract concepts present?
      {
        dimension: FeedbackDimension.ABSTRACTION_QUALITY,
        description: 'Checks for interface or abstract class usage.',
        check: (text: string) => {
          const hasInterface = /\b(interface|abstract|implements|extends)\b/.test(text);
          const hasProtocol = /\b(protocol|contract|abstraction|base\s+class|isp|dip)\b/.test(text);
          if (hasInterface) return { passed: true, score: 8, reasoning: 'Interface/abstract/implements keywords detected — good use of abstraction.' };
          if (hasProtocol) return { passed: true, score: 7, reasoning: 'Protocol or contract language detected — abstraction is conceptually present even if keyword is absent.' };
          return { passed: false, score: 2, reasoning: 'No interface or abstraction keywords found. LLD solutions should define contracts (interfaces) where variability is expected.' };
        },
      },

      // 3. EXTENSIBILITY — evidence of OCP / strategy / plugin seams
      {
        dimension: FeedbackDimension.EXTENSIBILITY,
        description: 'Checks for extensibility patterns (Strategy, Factory, OCP mentions).',
        check: (text: string) => {
          const patterns = ['strategy', 'factory', 'ocp', 'open', 'closed', 'plugin', 'extensi', 'new type', 'add later', 'polymorphi'];
          const matches = patterns.filter((p) => text.includes(p));
          if (matches.length >= 3) return { passed: true, score: 9, reasoning: `Strong extensibility signals: ${matches.join(', ')}.` };
          if (matches.length >= 1) return { passed: true, score: 6, reasoning: `Some extensibility signal (${matches.join(', ')}), but the design could be more explicit about extension points.` };
          return { passed: false, score: 2, reasoning: 'No extensibility patterns detected. Consider using Strategy, Factory, or interface-based extension points.' };
        },
      },

      // 4. SOLID_ADHERENCE — keyword evidence of SOLID principles
      {
        dimension: FeedbackDimension.SOLID_ADHERENCE,
        description: 'Checks for SOLID principle adherence signals.',
        check: (text: string) => {
          const srp = /\b(single\s+responsib|srp|one\s+reason\s+to\s+change)\b/.test(text);
          const ocp = /\b(open.*closed|closed.*modif|ocp)\b/.test(text);
          const lsp = /\b(liskov|substitut|lsp)\b/.test(text);
          const isp = /\b(interface\s+segregat|isp)\b/.test(text);
          const dip = /\b(depend.*inver|inver.*depend|dip|inject)\b/.test(text);
          const count = [srp, ocp, lsp, isp, dip].filter(Boolean).length;

          // Also check for God Class anti-pattern
          const godClass = /\b(god\s*class|blob|do\s+everything|handles\s+all|manages\s+everything)\b/.test(text);
          const longClassSize = isCode && (text.match(/\bclass\s+\w+/g)?.length === 1) && text.length > 2000;

          if (godClass || longClassSize) {
            return { passed: false, score: 2, reasoning: 'Potential God Class detected — one class appears to handle too many responsibilities, violating SRP.' };
          }
          if (count >= 3) return { passed: true, score: 9, reasoning: `Strong SOLID adherence: ${count}/5 principles explicitly referenced.` };
          if (count >= 1) return { passed: true, score: 6, reasoning: `${count}/5 SOLID principles referenced. Consider discussing others, especially Dependency Inversion.` };
          return { passed: false, score: 3, reasoning: 'No SOLID principles explicitly referenced. In an LLD interview, naming the relevant principles demonstrates design maturity.' };
        },
      },

      // 5. PATTERN_CORRECTNESS — does the problem's expected concepts appear?
      {
        dimension: FeedbackDimension.PATTERN_CORRECTNESS,
        description: 'Checks that design patterns relevant to this problem are used.',
        check: (text: string) => {
          const expectedConcepts = (attempt.problem?.expectedConcepts ?? []).map((c) =>
            c.toLowerCase(),
          );
          if (expectedConcepts.length === 0) {
            return { passed: true, score: 7, reasoning: 'No expected concepts defined for this problem — pattern check skipped.' };
          }
          const matched = expectedConcepts.filter((c) => text.includes(c));
          const ratio = matched.length / expectedConcepts.length;
          if (ratio >= 0.7) return { passed: true, score: 9, reasoning: `Matches ${matched.length}/${expectedConcepts.length} expected concepts: ${matched.join(', ')}.` };
          if (ratio >= 0.4) return { passed: true, score: 6, reasoning: `Matches ${matched.length}/${expectedConcepts.length} expected concepts. Missing: ${expectedConcepts.filter((c) => !matched.includes(c)).join(', ')}.` };
          return { passed: false, score: 2, reasoning: `Only ${matched.length}/${expectedConcepts.length} expected concepts found. Key missing concepts: ${expectedConcepts.filter((c) => !matched.includes(c)).join(', ')}.` };
        },
      },

      // 6. NAMING_CLARITY — meaningful names (no single-char vars, generic names)
      {
        dimension: FeedbackDimension.NAMING_CLARITY,
        description: 'Checks for meaningful, intention-revealing names.',
        check: (text: string) => {
          const vague = ['foo', 'bar', 'baz', 'temp', 'myclass', 'obj', 'data', 'thing', 'stuff', 'helper'];
          const vagueFound = vague.filter((v) => text.includes(v));
          const singleChar = isCode ? (text.match(/\b[a-z]\b/g) ?? []).length : 0;

          if (vagueFound.length > 0 || singleChar > 5) {
            return { passed: false, score: 4, reasoning: `Vague names detected: ${vagueFound.join(', ') || `${singleChar} single-char variables`}. Use intention-revealing names.` };
          }
          const goodNames = /\b(parking\w*|vehicle\w*|floor\w*|slot\w*|ticket\w*|elevator\w*|vend\w*|payment\w*|item\w*|capacity\w*|floor\w*|dispatch\w*)\b/;
          if (goodNames.test(text)) {
            return { passed: true, score: 9, reasoning: 'Names are domain-specific and intention-revealing — good naming clarity.' };
          }
          return { passed: true, score: 7, reasoning: 'No obviously vague names found. Names appear reasonable for this domain.' };
        },
      },
    ];
  }

  // ─── Private: Scoring ────────────────────────────────────────────────────────

  private computeOverallScore(dimensions: DimensionScore[], attempt: Attempt): number {
    const rubric = attempt.problem?.rubric ?? [];
    if (rubric.length === 0) {
      // Equal-weight average
      const total = dimensions.reduce((sum, d) => sum + d.score, 0);
      return Math.round((total / (dimensions.length * 10)) * 10 * 10) / 10;
    }

    // Weighted by problem rubric
    let weightedSum = 0;
    let totalWeight = 0;
    for (const rubricItem of rubric) {
      const dim = dimensions.find((d) => d.dimension === rubricItem.dimension);
      if (dim) {
        weightedSum += (dim.score / 10) * rubricItem.weight;
        totalWeight += rubricItem.weight;
      }
    }
    if (totalWeight === 0) {
      const total = dimensions.reduce((sum, d) => sum + d.score, 0);
      return Math.round((total / (dimensions.length * 10)) * 10 * 10) / 10;
    }
    return Math.round((weightedSum / totalWeight) * 10 * 10) / 10;
  }

  private buildSummary(dimensions: DimensionScore[], overallScore: number): string {
    const low = dimensions.filter((d) => d.score <= 3).map((d) => d.dimension.replace(/_/g, ' ').toLowerCase());
    const high = dimensions.filter((d) => d.score >= 8).map((d) => d.dimension.replace(/_/g, ' ').toLowerCase());

    const parts: string[] = [`Deterministic structural analysis gives an overall score of ${overallScore}/10.`];
    if (high.length > 0) parts.push(`Strengths: ${high.join(', ')}.`);
    if (low.length > 0) parts.push(`Areas to improve: ${low.join(', ')}.`);
    if (low.length === 0 && high.length >= 3) parts.push('Solid structural foundation — proceed to the full AI-powered review for deeper reasoning analysis.');
    return parts.join(' ');
  }

  private buildEmptyResult(attemptId: string, reason: string): EvaluationResult {
    return {
      attemptId,
      evaluatorName: this.name,
      overallScore: 0,
      dimensions: [],
      summary: reason,
      llmUnavailable: false,
      createdAt: new Date(),
    };
  }
}

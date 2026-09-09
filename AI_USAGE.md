# AI_USAGE.md — Meaningful AI-Assisted Decisions

> 3–5 specific decisions where AI played a meaningful role.
> Each entry: what AI suggested → what I accepted/rejected → why.

---

## Entry 1: Evaluation Architecture — Async vs Synchronous (Rejected AI's initial suggestion)

**AI Suggested:** On the first design pass, the agent drafted a synchronous evaluation flow where `/api/attempts/:id/submit` would run the DeterministicEvaluator inline and return the result in the same HTTP response. The reasoning was: "DeterministicEvaluator completes in < 50ms — no need for async complexity."

**My Decision:** Rejected. Changed to an async worker-based pattern.

**Why:** The DeterministicEvaluator is fast, but the LLMEvaluator (which is the value-add tier) takes 5–30 seconds. Designing the system around the fast path would have created a jarring UX cliff when AI evaluation is enabled — the submit button would hang for up to 30 seconds. The async pattern (submit → `evaluating` status → poll → result) is honest about the latency contract and makes the LLM tier's behaviour a first-class design decision rather than an afterthought. This also directly answers design question #5 ("what happens if evaluation takes time or fails?").

---

## Entry 2: EvaluationStrategy — Interface vs if/else Switch (Accepted AI's recommendation)

**AI Suggested:** Use a proper `EvaluationStrategy` TypeScript interface with `DeterministicEvaluator` and `LLMEvaluator` as separate classes, registered in an `EvaluatorRegistry`.

**Alternative I considered:** An inline `if (useAI) { ... } else { ... }` switch inside `EvaluationWorker` — simpler, fewer files.

**My Decision:** Accepted the interface approach.

**Why:** The assignment rubric explicitly weights extensibility at 10% and LLD/domain design at 25%. An if/else would require modifying `EvaluationWorker` to add any new evaluator — a clear OCP violation. The interface pattern means adding a linter-based evaluator is purely additive: implement `EvaluationStrategy.evaluate()`, call `EvaluatorRegistry.register(...)`. Zero other files change. I could point to this exact seam in the Design Note as a concrete extensibility proof — which is what the evaluators are grading.

---

## Entry 3: LLM Prompt Design — Generic vs Rubric-Grounded (Refined AI's approach)

**AI Suggested (initial draft):** A generic LLM prompt asking "evaluate this LLD submission across SOLID, patterns, and naming."

**My Refinement:** Injected the specific problem's `rubric[]` and `expectedConcepts[]` into the LLM prompt so feedback is anchored to that specific problem, not generic LLD platitudes.

**Why:** The assignment asks: "What makes feedback useful when multiple valid LLD solutions exist?" The answer is: feedback must explain *why* relative to a known rubric, not just list best practices. A generic prompt would give the same "consider using SOLID principles" feedback for a Parking Lot and an Elevator — useless signal. Rubric injection means the LLM can say "This Parking Lot solution scores low on Extensibility because it doesn't abstract the FeeCalculator, which is the problem's primary extension point" — which is actually actionable.

---

## Entry 4: Attempt State Machine — Pure Functions vs Class Methods (Accepted AI's approach, adapted)

**AI Suggested:** Model Attempt as a class with methods like `attempt.submit()`, `attempt.markEvaluating()` that mutate `this.status` in place.

**My Adaptation:** Used plain TypeScript interfaces + pure `applyAttemptTransition()` functions instead of a class with mutation.

**Why:** Mongoose documents are already mutable objects with their own lifecycle. A domain class that also mutates creates confusion about which layer owns the state. Pure transition functions (immutable, return new object) are: (1) trivially unit-testable without mocking a DB or class constructor, (2) compose cleanly with Mongoose's `findByIdAndUpdate`, and (3) make illegal transitions type-safe since `applyAttemptTransition` throws on invalid state — the state machine is enforced at the type level, not just by convention. All 29 tests reflect this: they test pure function inputs/outputs, no mocking needed.

---

## Entry 5: Auth Model — Rejected JWT, Chose UUID (Rejected AI's first suggestion)

**AI Suggested (first draft):** Implement email + JWT authentication since "learner history is a core feature."

**My Decision:** Rejected. Used UUID in `localStorage` instead.

**Why:** The assignment brief says "simple monolith is fully acceptable" and the guardrails explicitly warn against "multi-tenant auth, RBAC, rate-limiting infra." Building JWT auth would consume ~2–3 hours that should go toward the 25%-weighted domain model and the 15%-weighted evaluation approach. UUID-per-device meets the stated requirement ("learner can see previous attempts") for a demo context. I documented this trade-off explicitly in DECISIONS.md so the evaluators can see the reasoning — engineering judgement is rewarded more than feature completeness here.

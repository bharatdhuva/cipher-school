# DECISIONS.md — Running Log of Product & Engineering Decisions

> This file is the raw material for AI_USAGE.md and the Design Note trade-offs section.
> Every non-trivial product call made during this build is logged here in real time.

---

## D-01: Auth Model — UUID in localStorage (No Login)

**Decision**: Learner identity is a UUID generated and stored in `localStorage` on first visit. No email/password/JWT.

**Alternatives considered**:
- Email + JWT session (adds ~2-3 hours of implementation, enables cross-device history)

**Rationale**:
For a 2-day demo, the core value is the practice loop, not auth. UUID-per-device meets the requirement ("learner can see previous attempts") without introducing auth middleware, token refresh logic, or any user management surface. The design is explicitly framed: "simple monolith is fully acceptable."

**Trade-off accepted**: History is device-scoped. If the user clears localStorage, their history is gone. Acceptable for MVP.

---

## D-02: Job Queue — In-Process Mongo Polling (No Redis/BullMQ)

**Decision**: EvaluationWorker is a `setInterval`-based polling loop that queries MongoDB for `status: submitted | failed` attempts every 3 seconds.

**Alternatives considered**:
- BullMQ + Redis (more robust, retry semantics, UI progress events via pub/sub)

**Rationale**:
The brief explicitly says "simple in-process queue or a lightweight job table in Mongo — no need for Kafka/BullMQ+Redis unless you already have Redis wired up cheaply." Redis would add another service to the Docker Compose or deployment config, increasing demo setup friction. The Mongo polling approach is self-contained, observable (you can query the DB directly), and sufficient for a low-concurrency demo.

**Trade-off accepted**: Under concurrent load, polling has ~3s latency and is not horizontally scalable without introducing leader election. Acceptable for MVP demo.

---

## D-03: LLM Provider — OpenAI gpt-4o-mini

**Decision**: LLMEvaluator uses `gpt-4o-mini` via the OpenAI SDK with `response_format: { type: 'json_object' }` for structured output.

**Alternatives considered**:
- Google Gemini Flash (cheaper, comparable quality, supports structured output via Vertex AI)

**Rationale**:
OpenAI's `gpt-4o-mini` has native `response_format: json_object` support without any additional prompting tricks, making the structured dimension-score parsing predictable and robust. The OpenAI SDK is also simpler to install and configure locally vs. Vertex AI auth.

**Trade-off accepted**: Vendor lock-in to OpenAI; if the key is not available, the system gracefully falls back to deterministic-only evaluation with `llmUnavailable: true` on the result.

---

## D-04: Diagram Submission — Mermaid Text Paste (Not Excalidraw)

**Decision**: `DiagramSubmission` accepts raw Mermaid text. No Excalidraw iframe in the frontend.

**Alternatives considered**:
- Embed Excalidraw.com iframe, parse exported JSON diagram (adds ~4 hours, complex CORS handling)

**Rationale**:
The assignment's own guardrails say "keep the diagram-submission format optional/stretch — text and code are enough to prove the abstraction if time is short." The `DiagramSubmission` class is fully implemented and registered in the `SubmissionFormatFactory`, proving the extensibility seam. The UI just shows a text area with a Mermaid preview. This is honest about the trade-off and saves time for higher-weight areas (domain model, evaluators, tests).

**Trade-off accepted**: Diagram submission is not a rich UX. The extensibility proof is in the code, not the UI.

---

## D-05: Async Evaluation — Optimistic Status + Polling

**Decision**: On submit, the API immediately returns the `Attempt` in `submitted` status. The frontend polls `GET /api/attempts/:id` every 3s until status changes to `evaluated` or `failed`.

**Alternatives considered**:
- WebSocket push when evaluation completes (better UX, no polling overhead)
- SSE (Server-Sent Events)

**Rationale**:
WebSockets or SSE add meaningful complexity (socket management, reconnection logic, potential proxy config issues on Render/Vercel). Simple polling works reliably across all deployment targets without configuration. For a 2-day demo with low concurrency, 3s polling is imperceptible.

**Trade-off accepted**: Under load, polling adds DB read load every 3s per active user. Acceptable for demo scale.

---

## D-06: Strategy Pattern for Evaluators (Not Just if/else)

**Decision**: `EvaluationStrategy` is a proper TypeScript interface. `DeterministicEvaluator` and `LLMEvaluator` are separate classes implementing it. `EvaluatorRegistry` manages registration.

**AI suggested (via Claude)**: An inline `if/else` switch in `EvaluationWorker` (simpler, fewer files).

**Rejected because**: The assignment rubric explicitly grades on extensibility. An `if/else` would require modifying `EvaluationWorker` to add a new evaluator — violating OCP. The interface pattern means adding a linter-based evaluator (or a GPT-4o upgrade) is purely additive.

---

## D-07: Synchronous vs Async Evaluation — Rejected Synchronous

**Decision**: Evaluation is always asynchronous (worker-based). API returns immediately with `status: submitted`.

**AI suggested (via Claude initial draft)**: A synchronous evaluation on the `/submit` endpoint, since the deterministic evaluator is fast (< 50ms).

**Rejected because**: The LLM evaluator can take 5-30 seconds. Tying the HTTP response to LLM latency would either timeout or create very poor UX. The async worker pattern is more honest about the latency contract and directly answers design question #5.

---

## D-08: EvaluationResult as an Embedded Subdocument (Not a Separate Collection)

**Decision**: `EvaluationResult` is embedded inside the `Attempt` Mongoose document, not stored in a separate `evaluations` collection.

**Rationale**:
An `Attempt` always has at most one final `EvaluationResult`. Embedding avoids a join query every time a learner views their feedback. For future support of multiple evaluation rounds (e.g. "re-evaluate with a new evaluator"), the design can be changed to an array — that's an additive change.

**Trade-off accepted**: If evaluation results grow very large (many dimensions, long reasoning strings), the Attempt document could get large. Not a concern at MVP scale.

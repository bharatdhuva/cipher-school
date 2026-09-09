# Master Agent Prompt — CipherSchools "LLD Practice Platform" Assignment

> Paste this whole thing into Claude Code / Cursor as your starting instruction. It's written so the agent can work almost autonomously across the 2 days, but check in at the phase gates marked ⏸️.

---

## 0. Role & Context You Give the Agent

```
You are acting as my senior engineering pair-programmer for a 2-day take-home
hiring assignment from CipherSchools. The evaluators are grading on:

- Problem understanding & research — 15%
- Product thinking / creativity — 15%
- LLD / domain design — 25%   <-- single biggest weight, don't skimp here
- Evaluation & feedback approach — 15%
- Extensibility & engineering judgement — 10%
- Implementation quality — 10%
- Testing & reliability — 5%
- AI usage — 5%

This means: the class diagram and domain model matter more than UI polish,
and a small working slice beats a large half-broken one. Do NOT build an LMS.
Do NOT over-engineer infra (no Kubernetes/microservices/sharding — a monolith
is explicitly fine per the brief). Optimize for a demonstrable end-to-end loop:
choose problem → design → submit → get feedback → review → try again.

My stack: MERN — React + TypeScript (Vite) frontend, Node.js + Express
backend, MongoDB (Mongoose), Redis if needed for a job queue, deployed the
way I usually deploy (Vercel frontend, Render/Railway backend, or a single
Docker Compose — pick whichever is fastest to demo, tell me the trade-off).

Work in phases. After each phase, stop and show me what you built/decided
before moving to the next phase. Don't silently make product-defining
decisions — flag them and give me your recommendation + 1 alternative.
```

---

## 1. Deliverables Contract (map 1:1 to the submission form — do not deviate)

Tell the agent explicitly, because this is the actual grading surface:

```
The final submission form requires exactly these artifacts. Build toward
this list from hour one, not as an afterthought on day 2:

1. Research Note (PDF, 1–2 pages)
   - the learner problem
   - a few existing approaches/tools you researched (LeetCode-style judges,
     Educative/Grokking LLD courses, Exercism, real interview prep tools)
   - key gaps in what exists today
   - your product direction and why

2. Design Note (PDF, concise)
   - MVP scope and what's explicitly OUT of scope
   - user flow (the practice loop)
   - important classes/interfaces + responsibilities (this is the 25%-weight
     section — make it the centerpiece, use an actual diagram)
   - evaluation approach (deterministic vs LLM split)
   - key trade-offs and why you chose them over alternatives

3. Working Prototype — GitHub repo URL (public) + a deployed demo URL if
   time allows. Must show the full loop live: pick problem → attempt →
   submit → feedback → history → retry.

4. Tests — for core behaviour + at least a few failure/edge cases
   (e.g. malformed submission, evaluation timeout, evaluation service down,
   duplicate submission, empty design).

5. README.md — how to run the project, key decisions, known limitations.

6. AI_USAGE.md — 3 to 5 *meaningful* AI-assisted decisions: what the AI
   suggested, what I accepted or rejected, and why. Not "AI wrote my CSS."
   Pick decisions that show engineering judgement, e.g. AI suggested a
   synchronous evaluation call and I rejected it for an async job pattern
   because evaluation latency is unpredictable — that kind of thing.

Also prep, since the form asks for it directly: my Full Name, Email
(bharatdhuva27@gmail.com), Contact Number, LinkedIn Profile URL, and a
1–5 clarity rating with optional comments — draft me a short, honest
comment for that box once the project is done (not generic praise, actually
reference something specific from the brief).
```

---

## 2. The Product Brief, Verbatim Constraints (paste this block unmodified)

```
Build "Design and build a small practice experience that helps a learner
practice Low-Level Design, submit a solution, and receive useful, explainable
feedback."

Practice loop: Choose problem → Think/design → Submit → Get feedback →
Review → Try again.

MVP must demonstrate:
- Problem: a small set of LLD problems (Parking Lot, Elevator, Vending
  Machine style) with clear requirements and enough context to attempt.
- Practice: learner starts an attempt, works on a solution in a chosen form
  (text / code / diagram / combination).
- Submission: learner submits, sees status.
- Feedback: platform gives useful, explainable feedback on the design;
  AI may be used where reasoning helps.
- History: learner can see previous attempts — supports iteration, not
  just one-shot solving.
- Core design: the important domain behaviour is represented with clear
  classes/interfaces/responsibilities in the actual codebase, not just docs.

Answer these design questions explicitly in the Design Note:
1. What must a learner provide for an attempt to be meaningful?
2. What makes feedback useful when multiple valid LLD solutions exist?
3. Which parts of evaluation should be deterministic vs LLM-based?
4. How does the design accommodate a new evaluation approach or a new
   submission format later, without a rewrite?
5. What happens if evaluation takes time or fails? Keep it practical —
   this is NOT a distributed-systems assignment.

Scope boundary: simple monolith is fully acceptable. Don't spend time on
Kubernetes, microservices, multi-region, sharding, CDN design. HLD is only
a light closing note on how the prototype would handle more users or
slower AI evaluation — not a section to over-invest in.
```

---

## 3. Domain Model — Push the Agent to Go Deep Here (this is the 25%)

```
Before writing any route or UI code, produce a domain model and get my
sign-off. I want to see, at minimum:

- Problem (id, title, prompt, constraints, difficulty, expectedConcepts[])
- Attempt (learner, problem, status: draft/submitted/evaluating/evaluated/
  failed, submissionFormat, content, createdAt, submittedAt)
- Submission (the actual payload: text/code/diagram — model it so a new
  format can be added by implementing an interface, not branching on type
  strings everywhere)
- Evaluator / EvaluationStrategy (interface with a deterministic
  implementation and an LLM-based implementation — Strategy pattern so a
  3rd evaluator can be added later without touching Attempt or Submission)
- EvaluationResult (score/dimension breakdown, explanation text, which
  evaluator produced it, structured feedback — not a single opaque string)
- FeedbackDimension (e.g. Responsibility Assignment, Abstraction Quality,
  Extensibility, SOLID adherence — pick 4-6 dimensions and be consistent
  across problems)

Use these patterns deliberately and be ready to justify each one in the
Design Note (don't force patterns that don't earn their place):
- Strategy pattern for pluggable evaluators (deterministic rule-checks vs
  LLM reasoning) — this directly answers design question #3 and #4.
- A SubmissionFormat abstraction (interface with validate()/render()) so
  code/text/diagram are interchangeable to the rest of the system.
- A simple state machine for Attempt.status so "evaluation takes time or
  fails" (design question #5) is a first-class state, not an exception path.
- Repository/service separation so Mongoose isn't leaking into evaluation
  logic — keeps the domain testable without a DB.

Deliverable check: I should be able to point at a UML-ish class diagram
(even ASCII/mermaid is fine) and a real folder of interfaces/classes in
the repo that mirror it 1:1. Mismatch between diagram and code is an
instant credibility loss with evaluators — keep them in sync.
```

---

## 4. Evaluation & Feedback Approach (the second-biggest differentiator)

```
Split evaluation into two tiers, and say so explicitly in the Design Note:

Deterministic tier (fast, free, always runs first):
- structural checks: are there classes at all, are responsibilities named,
  is there an interface/abstraction where the problem clearly calls for
  one (e.g. multiple vehicle types, multiple payment strategies)
- anti-pattern checks: god classes, public mutable fields, missing
  encapsulation, obvious violation of the specific pattern the problem
  is testing for

LLM tier (reasoning-heavy, runs after deterministic tier passes basic
sanity, explains itself):
- evaluate SOLID adherence, extensibility, naming, trade-off reasoning
- MUST return structured, explainable output (per-dimension score +
  1-2 sentence reasoning each) — never a bare number. This directly
  answers "what makes feedback useful when multiple solutions are valid":
  useful feedback explains *why*, not just *what score*.
- prompt the LLM with the problem's rubric/expected concepts so feedback
  is grounded in that specific problem, not generic LLD platitudes.

Async handling (answers design question #5, keep this practical):
- Attempt moves to "evaluating" immediately on submit, learner sees a
  status indicator, no blocking request.
- Use a simple in-process queue or a lightweight job table in Mongo
  (no need for Kafka/BullMQ+Redis unless you already have Redis wired
  up cheaply) — poll or a single background worker interval is enough
  for a 2-day monolith.
- On LLM failure/timeout: fall back to deterministic-only feedback with
  a visible "AI feedback unavailable, showing structural checks only"
  state, plus a retry action. Never leave an attempt stuck silently.
- Idempotent evaluation: a retried evaluation shouldn't double-write
  results.
```

---

## 5. Extensibility Answer (design question #4 — make this concrete, not just words)

```
In the Design Note, don't just claim extensibility — point at the actual
seam in the code:
- "A new submission format (e.g. Excalidraw JSON diagram) is added by
  implementing SubmissionFormat.validate()/render() — Attempt, Evaluator,
  and the API layer need zero changes."
- "A new evaluator (e.g. a static-analysis linter for a code submission)
  is added by implementing EvaluationStrategy.evaluate() and registering
  it — the Attempt state machine and feedback rendering are unaffected."
Show one of these as a short code snippet in the Design Note as proof.
```

---

## 6. Build Plan — Day 1 / Day 2 (tell the agent to work in this order)

```
Day 1 (research + domain + skeleton):
1. Research note draft (30-45 min: search a few real tools, note gaps)
2. Domain model + class diagram, get my sign-off ⏸️
3. Backend skeleton: models, Strategy interfaces, state machine, 3 seeded
   problems with real rubrics
4. Deterministic evaluator fully working end-to-end (no LLM yet) —
   prove the loop works before adding AI complexity

Day 2 (AI evaluation + frontend + polish + docs):
5. LLM evaluator wired in behind the same interface, async job handling
6. Frontend: problem list → attempt workspace (pick text or code editor,
   don't build a full diagram tool unless there's spare time) → submit →
   status → feedback view with per-dimension breakdown → attempt history
7. Tests: domain logic (evaluators, state machine) unit tests + at least
   2-3 failure-path tests (timeout, malformed submission, evaluator error)
8. Deploy, smoke-test the live demo end-to-end
9. Write README.md and AI_USAGE.md (pick the 3-5 most defensible AI
   decisions, be specific and honest about a rejected suggestion too —
   evaluators explicitly reward showing judgement, not just AI output)
10. Export Research Note and Design Note to PDF, fill the submission form
```

---

## 7. Guardrails to Keep the Agent From Wasting Your 2 Days

```
- If you (the agent) find yourself designing multi-tenant auth, RBAC,
  rate-limiting infra, or a plugin marketplace — stop, that's out of scope.
- If a UI decision is taking more than 15 minutes of back-and-forth,
  default to the plainest version that demonstrates the loop and move on.
- Keep the diagram-submission format optional/stretch — text and code are
  enough to prove the abstraction if time is short; don't let it block
  everything else.
- Every time you (the agent) make a product call I didn't specify, write
  it down immediately in a running DECISIONS.md — this becomes the raw
  material for AI_USAGE.md and the trade-offs section of the Design Note,
  so I'm not reconstructing it from memory on day 2 night.
```

---

## 8. Final Self-Check Before I Submit (agent runs this checklist against the repo)

```
- [ ] Every item in section 3 "What Your MVP Should Demonstrate" table has
      a visible, demoable feature
- [ ] All 5 design questions from the brief are explicitly answered in
      Design Note, each with a pointer to actual code
- [ ] Class diagram in Design Note matches the code structure
- [ ] At least one deterministic check + one LLM-reasoning check are both
      live and both show up in a single feedback result
- [ ] Attempt history view actually shows 2+ attempts on the same problem
- [ ] Failure path (kill the LLM call) doesn't crash the app or hang the UI
- [ ] Tests run with a single command, README says what that command is
- [ ] AI_USAGE.md has 3-5 entries with: suggestion → accepted/rejected → why
- [ ] Research Note and Design Note are each exported as PDF, under the
      stated length
- [ ] Repo is public, README has a working run command a stranger could
      follow cold
```

---

### One line to open the actual agent session with:

> "Read the assignment PDF context above. Start with Phase 1 (research note draft) and Phase 2 (domain model). Stop after the domain model for my sign-off before writing any code."

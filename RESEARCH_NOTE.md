# RESEARCH_NOTE.md — The Learner Problem & Product Direction

**CipherSchools Hiring Assignment — SEP'2026**  
**Author:** Bharat Dhuva · bharatdhuva27@gmail.com  
**Deliverable #1 (15% Evaluation Weight)**

---

## 1. The Learner Problem

Low-Level Design (LLD) is notoriously easy to start but difficult to evaluate.

Unlike Data Structures and Algorithms (DSA) where competitive programming platforms can run binary unit test assertions against input/output signatures (e.g. `int[] twoSum(int[] nums, int target)`), **LLD has no single "correct" answer**. 

A learner designing a Parking Lot, an Elevator Controller, or a Vending Machine can write 300 lines of syntactically valid code, yet remain completely uncertain whether:
1. **Responsibilities are well-isolated**: Are domain classes handling a single responsibility, or are God Classes conflating persistence, pricing, and business logic?
2. **Abstractions provide proper seams**: Are consumers coupled to concrete implementations or clean interfaces? Can a new dynamic pricing model or elevator scheduling algorithm be swapped in without modifying core entities?
3. **Relationships & Cardinality are sound**: Is composition chosen over inheritance where appropriate? Are there circular dependencies or invalid references?
4. **Concurrency invariants hold**: Will multiple cars or button presses create race conditions under concurrent slot or ticket allocations?

Without structured feedback, learners develop poor design habits or fall into analysis paralysis.

---

## 2. Analysis of Existing Tools

| Platform / Tool | How It Operates | Critical Gap in LLD Context |
|---|---|---|
| **LeetCode / HackerRank** | Runs automated test suites checking binary return values and execution time. | Tests only functional correctness. Completely blind to OOP principles, interface seams, SOLID violations, and coupling. |
| **Educative / Grokking LLD** | Passive reading material presenting pre-baked reference solutions and static UML diagrams. | One-directional. Learners cannot submit their own custom designs or receive feedback on their specific trade-offs. |
| **Exercism / GitHub PR Mentorship** | Human mentors review pull requests and provide written feedback. | High quality, but feedback takes 12 to 72 hours. This destroys the iterative practice loop needed for rapid learning. |
| **Generic ChatGPT / Claude Prompts** | Learners paste their code into chat asking "Is this good LLD?" | Produces generic platitudes (*"Looks good! Consider using SOLID principles and adding comments"*). Not anchored to problem constraints or rubrics. |

---

## 3. Key Gaps Identified

1. **Zero Objective Trade-off Signal**: Existing tools either give a binary pass/fail or arbitrary personal opinions. They fail to explain *why* an architectural choice creates specific trade-offs (e.g. coarse-grained mutex lock vs. fine-grained per-slot locks).
2. **No Iterative Practice Loop**: Most platforms treat problem solving as a one-time event rather than an iterative refinement cycle (*Choose → Design → Submit → Review Feedback → Refine & Re-attempt*).
3. **Absence of a Two-Tier Evaluation Model**: Existing automated checkers either do superficial keyword checks or ungrounded LLM prompts that hallucinate. A true LLD platform requires fast deterministic structural checks (<50ms) paired with anchored reasoning.

---

## 4. Product Direction & Thesis

Our MVP is built around a single, tight practice journey:

$$\text{Choose Problem} \longrightarrow \text{Think / Design} \longrightarrow \text{Submit} \longrightarrow \text{Get Explainable Feedback} \longrightarrow \text{Review History} \longrightarrow \text{Try Again}$$

### Architectural Pillars of the MVP:
1. **Curated Problem Blueprints**: Selected classic problems (Multi-Floor Parking Lot, Elevator Dispatcher, Vending Machine) with unambiguous functional requirements, explicit constraints, and clear domain boundaries.
2. **Flexible Submission Format**: First-class support for Code (TypeScript/Java/Python), Design Specs, and Diagram Notation (Mermaid text) through a pluggable `SubmissionFormat` abstraction.
3. **Two-Tier Evaluation Strategy**:
   - **Tier 1 (Deterministic Static Audit)**: Instant AST/structural audit checking class counts, interface boundaries, encapsulation leaks, and required patterns in under 50ms without AI overhead.
   - **Tier 2 (Anchored Reasoning Engine)**: Evaluates SRP, abstraction seams, and concurrency trade-offs grounded directly in the problem's weighted rubric.
4. **Resilient Failure Handling**: If the AI evaluation times out or fails, the platform transitions gracefully to `FALLBACK_TRIGGERED`, presenting the deterministic audit with a single-click retry, ensuring the learner is never blocked.

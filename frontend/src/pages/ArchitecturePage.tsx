import React, { useEffect, useRef, useState } from 'react';
import { Printer, Play } from 'lucide-react';

interface ArchitecturePageProps {
  onStartPractice: () => void;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ onStartPractice }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'uml' | 'questions' | 'research' | 'ai'>('uml');

  useEffect(() => {
    if ((window as any).mermaid && mermaidRef.current) {
      try {
        (window as any).mermaid.contentLoaded();
      } catch (e) {
        console.warn('Mermaid render error:', e);
      }
    }
  }, [activeTab]);

  return (
    <main id="main-content" className="flex-1 py-8 lg:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full">
                Assignment Deliverables 1, 2, 4 &amp; 6 (40% Total Weight)
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-[-0.02em]">
                Domain Model, Research &amp; Design Notes
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Complete engineering deliverables: Research Note, UML Class Diagram (25%), the 5 Core Design Questions, and the AI Usage Decisions Log.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => window.print()} 
                className="btn btn-md btn-secondary text-xs"
              >
                <Printer className="w-4 h-4" /> Export / Print Deliverables
              </button>
              <button 
                type="button" 
                onClick={onStartPractice} 
                className="btn btn-md btn-primary text-xs"
              >
                <Play className="w-4 h-4" /> Test in Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Deliverable Sections */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold" role="tablist">
          <button 
            type="button" 
            onClick={() => setActiveTab('uml')}
            className={`px-4 py-2 rounded-[6px] ${activeTab === 'uml' ? 'bg-green-50 text-green-800 border border-green-200 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} whitespace-nowrap transition-all`}
          >
            1. UML Class Diagram &amp; Domain Model (25%)
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-[6px] ${activeTab === 'questions' ? 'bg-green-50 text-green-800 border border-green-200 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} whitespace-nowrap transition-all`}
          >
            2. The 5 Core Design Questions
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('research')}
            className={`px-4 py-2 rounded-[6px] ${activeTab === 'research' ? 'bg-green-50 text-green-800 border border-green-200 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} whitespace-nowrap transition-all`}
          >
            3. Research Note (Deliverable #1)
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-[6px] ${activeTab === 'ai' ? 'bg-green-50 text-green-800 border border-green-200 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'} whitespace-nowrap transition-all`}
          >
            4. AI Decisions Log (AI_USAGE.md)
          </button>
        </div>

        {/* Section 1: Interactive UML Class Diagram (Mermaid) */}
        {(activeTab === 'uml') && (
          <section className="bg-white p-6 sm:p-8 border border-slate-200 rounded-[8px] shadow-soft space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-600">Core Domain Architecture (25% Weight)</span>
                <h2 className="text-xl font-bold text-slate-900">UML Class Diagram &amp; Extensibility Seams</h2>
              </div>
              <span className="pill-badge badge-green text-xs">Strategy Pattern + SubmissionFormat Abstraction</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              Below is the explicit domain model for the LLD Practice Platform. Notice the <strong>Strategy Pattern</strong> for pluggable evaluators (Deterministic vs LLM) and the <strong>SubmissionFormat</strong> interface which allows code, text, or diagram submissions without touching core entities.
            </p>

            {/* Mermaid Container */}
            <div ref={mermaidRef} className="p-6 bg-slate-50 border border-slate-200 rounded-[6px] overflow-x-auto">
              <pre className="mermaid text-xs">
{`classDiagram
    direction TB

    class Problem {
        +String id
        +String title
        +String summary
        +List~String~ requirements
        +String starterCode
        +String difficulty
    }

    class Attempt {
        +String id
        +String problemId
        +AttemptStatus status
        +DateTime submittedAt
        +Submission payload
        +EvaluationResult result
        +transitionTo(status)
    }

    class AttemptStatus {
        <<enumeration>>
        DRAFT
        SUBMITTED
        EVALUATING
        EVALUATED
        FALLBACK_TRIGGERED
        FAILED
    }

    class Submission {
        +String id
        +SubmissionFormat format
        +String content
        +validate()
    }

    class SubmissionFormat {
        <<interface>>
        +validate(content) bool
        +render(content) Element
    }

    class CodeSubmissionFormat {
        +String language
        +validate()
    }
    class TextDesignFormat {
        +validate()
    }
    class DiagramSubmissionFormat {
        +validate()
    }

    class EvaluationStrategy {
        <<interface>>
        +evaluate(problem, submission) EvaluationResult
    }

    class DeterministicStructuralEvaluator {
        +checkClasses()
        +checkInterfaces()
        +detectGodClass()
        +verifyEncapsulation()
    }

    class ReasoningArchitecturalEvaluator {
        +evaluateSRP()
        +evaluateAbstractions()
        +evaluateConcurrency()
        +generateFeedback()
    }

    class EvaluationResult {
        +int overallScore
        +List~FeedbackDimension~ dimensions
        +List~String~ strengths
        +List~String~ improvements
        +String evaluatorUsed
    }

    class FeedbackDimension {
        +String name
        +int score
        +String explanation
    }

    Problem "1" -- "*" Attempt : receives
    Attempt "1" *-- "1" Submission : encapsulates
    Attempt ..> AttemptStatus : tracks state
    Submission ..> SubmissionFormat : abstracts
    CodeSubmissionFormat ..|> SubmissionFormat
    TextDesignFormat ..|> SubmissionFormat
    DiagramSubmissionFormat ..|> SubmissionFormat
    Attempt "1" *-- "0..1" EvaluationResult : holds
    EvaluationResult "1" *-- "*" FeedbackDimension : breaks down
    DeterministicStructuralEvaluator ..|> EvaluationStrategy : Tier 1
    ReasoningArchitecturalEvaluator ..|> EvaluationStrategy : Tier 2`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1.5">
                <h4 className="font-semibold text-slate-900">Extensibility Seam: Pluggable Evaluators</h4>
                <p className="text-slate-600 leading-relaxed">
                  A new evaluator (e.g. SonarQube linter or Python AST parser) is added by implementing <code>EvaluationStrategy.evaluate()</code>. The <code>Attempt</code> state machine and feedback presentation need zero modifications.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1.5">
                <h4 className="font-semibold text-slate-900">Extensibility Seam: Pluggable Formats</h4>
                <p className="text-slate-600 leading-relaxed">
                  A new format (e.g. Excalidraw JSON or PlantUML) is added by implementing <code>SubmissionFormat.validate()</code>. The storage, evaluator orchestrator, and API layer remain untouched.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Section 2: Answers to the 5 Core Design Questions */}
        {(activeTab === 'questions') && (
          <section className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600">The 5 Core Design Questions</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-[-0.02em]">
                Engineering Rationale &amp; Trade-offs
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">Explicit answers backed by the working implementation in this prototype.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              
              <div className="p-6 bg-white border border-slate-200 rounded-[8px] shadow-soft space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center">1</span>
                  <h3 className="text-base font-semibold text-slate-900">What does a learner actually need to provide for an LLD attempt to be meaningful?</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  A meaningful LLD attempt does <strong>not</strong> require full working business execution or hundreds of lines of boilerplate. Instead, it requires:
                  <br/>• <strong>Domain Entities &amp; Class Boundaries</strong>: Clear naming and responsibilities for each class.
                  <br/>• <strong>Abstractions / Interfaces</strong>: Explicit seams for swappable strategies (e.g. <code>ParkingStrategy</code>, <code>PricingModel</code>).
                  <br/>• <strong>State Transitions &amp; Invariants</strong>: Concurrency locks or state enums indicating how race conditions and illegal transitions are prevented.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[8px] shadow-soft space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center">2</span>
                  <h3 className="text-base font-semibold text-slate-900">What makes feedback useful when there can be more than one valid LLD solution?</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  Useful feedback never declares a design "wrong" simply because it differs from an arbitrary reference solution. Instead, it is <strong>explainable and trade-off focused</strong>:
                  <br/>• It evaluates the design against fundamental engineering principles: <em>SRP, coupling, extensibility, and thread-safety</em>.
                  <br/>• It articulates <strong>WHY</strong> a decision has trade-offs (e.g., <em>"Using a coarse-grained synchronized lock on ParkingLot prevents race conditions but limits checkout throughput under peak load"</em>).
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[8px] shadow-soft space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center">3</span>
                  <h3 className="text-base font-semibold text-slate-900">Which parts of evaluation should be deterministic, and which parts benefit from an LLM?</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  Implemented in our two-tier evaluation strategy (<code>backend/src/evaluation/</code>):
                  <br/>• <strong>Deterministic Tier (Static Rules)</strong>: Syntax validity, class count, encapsulation checks (no public mutable fields), detection of God-Classes (&gt;10 responsibilities), and verification that required design patterns (Strategy, State) exist.
                  <br/>• <strong>LLM Reasoning Tier</strong>: Nuanced assessment of SOLID adherence, abstraction boundaries, coupling indices, and contextual suggestions tailored to the problem requirements.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[8px] shadow-soft space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center">4</span>
                  <h3 className="text-base font-semibold text-slate-900">How would your design accommodate another evaluation approach or another submission format later?</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  Through the <strong>Strategy Pattern</strong> and <strong>Format Abstraction</strong>:
                  <br/>• A new submission format (e.g. Mermaid or Excalidraw JSON diagram) implements <code>SubmissionFormat.validate()</code> — the <code>Attempt</code>, <code>Evaluator</code>, and storage require zero modifications.
                  <br/>• A new evaluator (e.g. SonarQube linter or unit test runner) implements <code>EvaluationStrategy.evaluate()</code> and registers itself into the orchestrator without touching existing classes.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[8px] shadow-soft space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center">5</span>
                  <h3 className="text-base font-semibold text-slate-900">What should happen if evaluation takes time or fails?</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  • <strong>First-Class State Machine</strong>: <code>AttemptStatus</code> treats <code>EVALUATING</code> and <code>FALLBACK_TRIGGERED</code> as explicit states rather than unhandled promise rejections.
                  <br/>• <strong>Deterministic Fallback</strong>: If the LLM call times out or fails, the platform automatically presents the Tier-1 structural audit with an informative banner and a single-click "Retry AI Reasoning" button.
                </p>
              </div>

            </div>
          </section>
        )}

        {/* Section 3: Research Note (Deliverable #1) */}
        {(activeTab === 'research') && (
          <section className="bg-white p-6 sm:p-8 border border-slate-200 rounded-[8px] shadow-soft space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600">Deliverable #1 (15% Weight)</span>
              <h2 className="text-xl font-bold text-slate-900">Research Note: The Learner Problem &amp; Product Direction</h2>
              <p className="text-xs text-slate-500">1–2 pages research note summarizing current tools, key gaps, and our architectural thesis.</p>
            </div>

            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-600">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">1. The Learner Problem</h3>
                <p>
                  Low-Level Design (LLD) is easy to start but notoriously difficult to evaluate. Unlike Data Structures and Algorithms (DSA) where LeetCode can run automated unit test assertions against <code>int[] twoSum()</code>, an LLD problem has no single "correct" answer. A learner designing a Parking Lot, Elevator, or Vending Machine can write 300 lines of syntactically valid code, yet remain completely uncertain whether their responsibilities are well-isolated, whether their interfaces create tight coupling, or whether their concurrency invariants will collapse under race conditions.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">2. Analysis of Existing Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1">
                    <span className="font-semibold text-slate-900">LeetCode / HackerRank</span>
                    <p className="text-[11px] text-slate-500">Binary pass/fail test execution. Completely misses OOP design principles, SOLID violations, and architecture trade-offs.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1">
                    <span className="font-semibold text-slate-900">Educative / Grokking LLD</span>
                    <p className="text-[11px] text-slate-500">Passive reading experience. Shows one reference solution; learners cannot submit custom designs or receive interactive feedback.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1">
                    <span className="font-semibold text-slate-900">Exercism / PR Mentorship</span>
                    <p className="text-[11px] text-slate-500">High quality human code reviews, but slow turnaround (hours to days) preventing iterative, fast practice loops.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">3. Key Gaps in What Exists Today</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Zero Objective Trade-off Signal</strong>: Learners are either given binary pass/fail or arbitrary personal opinions.</li>
                  <li><strong>Lack of Iteration Support</strong>: Most platforms encourage one-time solving rather than iterating on a design across multiple attempts.</li>
                  <li><strong>No Dual-Tier Evaluation</strong>: Tools either do superficial regex checks or ungrounded generic LLM prompts that hallucinate praise.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">4. Our Product Direction</h3>
                <p>
                  We built a focused LLD Practice Platform centered on the 6-step loop: <em>Choose Problem → Think/Design → Submit → Get Feedback → Review → Try Again</em>. We combine immediate deterministic static structural audits (Tier 1) with rubric-grounded reasoning evaluations (Tier 2).
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Section 4: Meaningful AI-Assisted Decisions Log (AI_USAGE.md) */}
        {(activeTab === 'ai') && (
          <section className="bg-white p-6 sm:p-8 border border-slate-200 rounded-[8px] shadow-soft space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600">AI Usage Transparency (5% Weight)</span>
              <h2 className="text-xl font-bold text-slate-900">AI-Assisted Decisions Log (AI_USAGE.md)</h2>
              <p className="text-xs text-slate-500">5 meaningful decisions showing engineering judgment: what AI suggested, what was accepted or rejected, and why.</p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Decision 1: Synchronous vs. Asynchronous Evaluation Loop</span>
                  <span className="pill-badge badge-amber text-[10px]">Rejected AI Suggestion</span>
                </div>
                <p className="text-slate-600">
                  <strong>AI Suggestion</strong>: Make the evaluation API a simple synchronous blocking POST request.<br/>
                  <strong>My Decision</strong>: Rejected. Changed to an asynchronous worker/state machine pattern. While deterministic checks are fast (&lt;50ms), LLMs take 2–6 seconds. The async pattern makes timeout fallback a first-class state rather than an unhandled crash.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Decision 2: EvaluationStrategy — Interface vs if/else Switch</span>
                  <span className="pill-badge badge-green text-[10px]">Accepted AI Recommendation</span>
                </div>
                <p className="text-slate-600">
                  <strong>AI Suggestion</strong>: Use an explicit <code>EvaluationStrategy</code> interface with <code>DeterministicStructuralEvaluator</code> and <code>LLMEvaluator</code> as separate implementations.<br/>
                  <strong>My Decision</strong>: Accepted. The assignment grades extensibility at 10%. An inline if/else would violate the Open-Closed Principle (OCP), requiring modification to add linters.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Decision 3: LLM Prompt Design — Generic vs Rubric-Grounded</span>
                  <span className="pill-badge badge-green text-[10px]">Refined AI Approach</span>
                </div>
                <p className="text-slate-600">
                  <strong>AI Suggestion</strong>: A generic zero-shot prompt asking "evaluate this LLD submission across SOLID and naming."<br/>
                  <strong>My Decision</strong>: Refined. Injected the problem's specific requirements, expected patterns (Strategy/State), and anchored rubric into the evaluation matrix to prevent generic platitudes.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Decision 4: Attempt State Machine Modeling</span>
                  <span className="pill-badge badge-green text-[10px]">Adapted AI Pattern</span>
                </div>
                <p className="text-slate-600">
                  <strong>AI Suggestion</strong>: Model Attempt as a mutable class mutating internal state directly.<br/>
                  <strong>My Decision</strong>: Adapted into pure transition functions (<code>draft</code> → <code>submitted</code> → <code>evaluating</code> → <code>evaluated</code> / <code>failed</code>). This makes illegal transitions impossible and simplifies unit testing failure states.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Decision 5: Auth Architecture — Rejected JWT, Chose UUID</span>
                  <span className="pill-badge badge-amber text-[10px]">Rejected AI Suggestion</span>
                </div>
                <p className="text-slate-600">
                  <strong>AI Suggestion</strong>: Build full email + JWT authentication middleware.<br/>
                  <strong>My Decision</strong>: Rejected per Section 5 guardrails ("Do not spend time on auth/multi-tenant infra"). Identified the learner via UUID in localStorage, freeing engineering time for the 25%-weighted domain model and 15%-weighted evaluation engine.
                </p>
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
};

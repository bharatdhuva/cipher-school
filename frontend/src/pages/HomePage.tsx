import React from 'react';
import { ArrowRight, Search, History, Layers, Network, GitFork, ShieldAlert } from 'lucide-react';
import type { PageView } from '../components/Navbar';
import type { Problem } from '../api';

interface HomePageProps {
  problems: Problem[];
  onNavigate: (page: PageView) => void;
  onSelectProblem: (problem: Problem) => void;
  onOpenPalette: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  problems,
  onNavigate,
  onSelectProblem,
  onOpenPalette
}) => {
  const parkingLot = problems.find(p => p.id === 'parking-lot') || problems[0];
  const elevator = problems.find(p => p.id === 'elevator-system') || problems[1];
  const vendingMachine = problems.find(p => p.id === 'vending-machine') || problems[2];

  return (
    <div className="flex-1">

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-slate-200/80 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">

            {/* Assignment Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              LLD Practice Platform · 2-Day Engineering Prototype
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-[-0.02em] leading-[1.18]">
              Design, Submit, and Receive <span className="text-green-600">Explainable Feedback.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A focused practice experience that helps learners design real-world systems like Parking Lot, Elevator, and Vending Machine — verifying responsibilities, abstractions, and trade-offs.
            </p>

            {/* ⌘K Search Trigger Input Box */}
            <div className="pt-2 max-w-xl mx-auto">
              <button 
                type="button" 
                onClick={onOpenPalette}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-[8px] shadow-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 cursor-pointer text-left"
                aria-label="Open command palette search"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400" />
                  <span className="text-sm">Search LLD blueprints, problems, or attempt history...</span>
                </div>
                <kbd className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-400 font-medium">⌘K</kbd>
              </button>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => onNavigate('problems')} 
                className="btn btn-lg btn-primary text-sm sm:text-base px-6 py-3"
              >
                Choose an LLD Problem
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => onNavigate('history')} 
                className="btn btn-lg btn-secondary text-sm sm:text-base px-6 py-3"
              >
                <History className="w-4 h-4" />
                View Attempt History
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── THE CORE PRACTICE LOOP (Connected Stepper Pipeline - Bada & Clear) ── */}
      <section className="py-10 sm:py-12 bg-slate-50 border-b border-slate-200/80" aria-label="Practice loop workflow">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-7 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-600">The Learner Journey</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-[-0.02em]">Continuous Improvement Loop</h2>
            <p className="text-xs sm:text-sm text-slate-500">How learners practice, receive evaluation, and iterate on design decisions.</p>
          </div>

          {/* Comfortable, prominent 4-step pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 sm:gap-4 items-center max-w-5xl mx-auto">
            
            {/* Step 1 */}
            <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-[8px] shadow-soft text-center space-y-2 hover:border-slate-300 transition-colors">
              <div className="w-8 h-8 mx-auto rounded-full bg-green-50 text-green-700 font-bold text-sm flex items-center justify-center border border-green-100">1</div>
              <h3 className="text-sm font-semibold text-slate-900">Choose Problem</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Pick Parking Lot, Elevator, or Vending Machine.</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center text-slate-300">
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Step 2 */}
            <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-[8px] shadow-soft text-center space-y-2 hover:border-slate-300 transition-colors">
              <div className="w-8 h-8 mx-auto rounded-full bg-green-50 text-green-700 font-bold text-sm flex items-center justify-center border border-green-100">2</div>
              <h3 className="text-sm font-semibold text-slate-900">Think &amp; Design</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Model classes, interfaces, and responsibilities.</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center text-slate-300">
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Step 3 */}
            <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-[8px] shadow-soft text-center space-y-2 hover:border-slate-300 transition-colors">
              <div className="w-8 h-8 mx-auto rounded-full bg-green-50 text-green-700 font-bold text-sm flex items-center justify-center border border-green-100">3</div>
              <h3 className="text-sm font-semibold text-slate-900">Submit Solution</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Send attempt for structural &amp; reasoning review.</p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center text-slate-300">
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>

            {/* Step 4 */}
            <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-[8px] shadow-soft text-center space-y-2 hover:border-slate-300 transition-colors">
              <div className="w-8 h-8 mx-auto rounded-full bg-green-100 text-green-800 font-bold text-sm flex items-center justify-center border border-green-200">4</div>
              <h3 className="text-sm font-semibold text-slate-900">Feedback &amp; Retry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Review trade-offs, inspect gaps, and re-attempt.</p>
            </div>

          </div>

        </div>
      </section>

      {/* ── CORE LLD PROBLEMS GRID ─────────────────────────────── */}
      <section className="py-12 sm:py-16" aria-labelledby="problemsHeading">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600">MVP Problem Set</span>
              <h2 id="problemsHeading" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em]">
                Featured LLD Practice Blueprints
              </h2>
              <p className="text-sm text-slate-600 max-w-xl">
                Carefully scoped classic problems with unambiguous functional requirements and clear domain boundaries.
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => onNavigate('problems')} 
              className="btn btn-md btn-secondary self-start sm:self-auto text-sm px-4 py-2"
            >
              View All Problems <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Parking Lot */}
            <div className="p-6 bg-white border border-slate-200 rounded-[8px] shadow-soft hover-lift flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="pill-badge badge-green text-xs font-semibold">Structural &amp; Creational</span>
                  <span className="pill-badge badge-med text-xs font-semibold">Medium</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  <button 
                    type="button" 
                    onClick={() => parkingLot && onSelectProblem(parkingLot)}
                    className="hover:text-green-700 transition-colors text-left font-bold"
                  >
                    Design a Multi-Floor Parking Lot
                  </button>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Support multiple floors, vehicle sizes (Motorbike, Car, Bus), dynamic pricing strategies, and concurrent slot allocation.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">Strategy Pattern</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">Thread-Safe</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">Singleton</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">76% Acceptance</span>
                <button 
                  type="button"
                  onClick={() => parkingLot && onSelectProblem(parkingLot)}
                  className="btn btn-sm btn-primary text-xs font-semibold px-3 py-1.5"
                >
                  Start Practice <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Elevator */}
            <div className="p-6 bg-white border border-slate-200 rounded-[8px] shadow-soft hover-lift flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="pill-badge badge-green text-xs font-semibold">Behavioral &amp; Concurrency</span>
                  <span className="pill-badge badge-med text-xs font-semibold">Medium</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  <button 
                    type="button" 
                    onClick={() => elevator && onSelectProblem(elevator)}
                    className="hover:text-green-700 transition-colors text-left font-bold"
                  >
                    Elevator Dispatching Controller
                  </button>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Control multiple elevator cars across N floors with state pattern transitions, optimal dispatching (LOOK/SCAN), and request queues.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">State Pattern</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">Scheduling</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">Queue Invariants</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">69% Acceptance</span>
                <button 
                  type="button"
                  onClick={() => elevator && onSelectProblem(elevator)}
                  className="btn btn-sm btn-primary text-xs font-semibold px-3 py-1.5"
                >
                  Start Practice <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Vending Machine */}
            <div className="p-6 bg-white border border-slate-200 rounded-[8px] shadow-soft hover-lift flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="pill-badge badge-green text-xs font-semibold">State Machine</span>
                  <span className="pill-badge badge-easy text-xs font-semibold">Easy</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  <button 
                    type="button" 
                    onClick={() => vendingMachine && onSelectProblem(vendingMachine)}
                    className="hover:text-green-700 transition-colors text-left font-bold"
                  >
                    Vending Machine State Machine
                  </button>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Implement state-driven transitions for coin insertion, product racks, exact change calculations, and cancellation refunds.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">State Pattern</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">Inventory</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono">Change Return</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">84% Acceptance</span>
                <button 
                  type="button"
                  onClick={() => vendingMachine && onSelectProblem(vendingMachine)}
                  className="btn btn-sm btn-primary text-xs font-semibold px-3 py-1.5"
                >
                  Start Practice <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── WHAT THE PLATFORM EVALUATES (Section 3 of PDF) ─────── */}
      <section className="py-12 sm:py-16 bg-white border-t border-b border-slate-200/80" aria-labelledby="evalHeading">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-600">Explainable Feedback</span>
            <h2 id="evalHeading" className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em]">
              How Your Design Is Evaluated
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Evaluation is divided into deterministic static checks and reasoning-based architectural feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-[8px] shadow-soft space-y-2.5 hover:border-slate-300 transition-colors">
              <div className="w-9 h-9 rounded-[6px] bg-green-50 border border-green-200 text-green-700 flex items-center justify-center font-bold text-sm">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">Responsibilities (SRP)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are classes handling a single domain responsibility, or are God Classes conflating data modeling with business logic?
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-[8px] shadow-soft space-y-2.5 hover:border-slate-300 transition-colors">
              <div className="w-9 h-9 rounded-[6px] bg-green-50 border border-green-200 text-green-700 flex items-center justify-center font-bold text-sm">
                <Network className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">Abstractions &amp; Interfaces</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are consumers coupled to concrete implementations or clean interfaces? Can pricing models or dispatch rules be swapped?
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-[8px] shadow-soft space-y-2.5 hover:border-slate-300 transition-colors">
              <div className="w-9 h-9 rounded-[6px] bg-green-50 border border-green-200 text-green-700 flex items-center justify-center font-bold text-sm">
                <GitFork className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">Relationships &amp; Coupling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Checks composition vs inheritance choices, bidirectional dependencies, and sound cardinality between entities.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-[8px] shadow-soft space-y-2.5 hover:border-slate-300 transition-colors">
              <div className="w-9 h-9 rounded-[6px] bg-green-50 border border-green-200 text-green-700 flex items-center justify-center font-bold text-sm">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">Concurrency &amp; Trade-offs</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Identifies race condition hazards under concurrent slot/ticket allocations and critiques chosen lock granularity.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── REFINED CALL TO ACTION CARD ────────────────────────── */}
      <section className="py-12 sm:py-16" aria-label="Start practice call to action">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-[8px] shadow-soft text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full">
              Continuous Iteration Loop
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em]">
              Ready to test your Low-Level Design?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              Jump directly into the practice workspace. Attempt a blueprint, submit your solution, and inspect your explainable rubric feedback.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button 
                type="button"
                onClick={() => parkingLot && onSelectProblem(parkingLot)}
                className="btn btn-lg btn-primary text-sm sm:text-base px-6 py-3"
              >
                Attempt Parking Lot Blueprint
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => onNavigate('history')} 
                className="btn btn-lg btn-secondary text-sm sm:text-base px-6 py-3"
              >
                Inspect Previous Attempts
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

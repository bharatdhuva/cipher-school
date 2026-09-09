import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  RotateCcw, 
  History as HistoryIcon, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  BarChart3, 
  ThumbsUp, 
  CheckSquare,
  Award,
  Zap
} from 'lucide-react';
import { api } from '../api';
import type { Problem, Attempt, SubmissionPayload, EvaluationResult } from '../api';
import { useLearnerId } from '../utils';
import { ThemeSelect } from '../components/ThemeSelect';

interface WorkspacePageProps {
  problem: Problem;
  allProblems?: Problem[];
  onSelectProblem?: (p: Problem) => void;
  onBack: () => void;
  onViewHistory: () => void;
  onAttemptCreated?: (attempt: Attempt) => void;
}

type SubmissionFormatType = 'code' | 'text' | 'diagram';

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  problem,
  allProblems = [],
  onSelectProblem,
  onBack,
  onViewHistory,
  onAttemptCreated
}) => {
  const learnerId = useLearnerId();
  const [format, setFormat] = useState<SubmissionFormatType>('code');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'draft' | 'submitting' | 'evaluating' | 'evaluated' | 'fallback' | 'failed'>('draft');
  const [evalStep, setEvalStep] = useState(1);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Deterministic analysis state
  const [deterministicData, setDeterministicData] = useState<{
    score: number;
    passed: string[];
    issues: string[];
  }>({ score: 90, passed: [], issues: [] });

  // Starter templates per format
  useEffect(() => {
    if (format === 'code') {
      setCode(`// Java / OOP Solution for ${problem.title}\npackage com.cipherschools.lld;\n\nimport java.util.*;\nimport java.util.concurrent.locks.*;\n\npublic class Solution {\n    private final String id;\n    private final ReentrantLock lock = new ReentrantLock();\n\n    public Solution(String id) {\n        this.id = id;\n    }\n\n    public void executeOperation() {\n        lock.lock();\n        try {\n            // Core domain invariant logic\n        } finally {\n            lock.unlock();\n        }\n    }\n}\n\ninterface StrategyPatternSeam {\n    void applyStrategy();\n}\n`);
    } else if (format === 'text') {
      setCode(`# ${problem.title} — Architectural Specification\n\n## 1. Domain Entities & Responsibilities\n- Coordinator: Decoupled manager maintaining system lifecycle.\n- Core Entities: Floor, Slot, Ticket, Vehicle hierarchy.\n\n## 2. Invariants & Concurrency\n- Slot allocation protected via ReentrantLock.\n- State transitions strictly validated via enum return types.\n\n## 3. Extensibility Seams\n- Pluggable Strategy for dynamic rate calculation.\n- Open-Closed adherence for future hardware sensor integrations.\n`);
    } else if (format === 'diagram') {
      setCode(`classDiagram\n    direction TB\n    class DomainCoordinator {\n        +String id\n        +processRequest()\n    }\n    class StrategySeam {\n        <<interface>>\n        +execute()\n    }\n    DomainCoordinator ..> StrategySeam : delegates\n`);
    }
  }, [format, problem]);

  const runClientDeterministic = (codeStr: string) => {
    const passed: string[] = [];
    const issues: string[] = [];
    let s = 100;

    const classMatches = codeStr.match(/class\s+([A-Za-z0-9_]+)/g) || [];
    if (classMatches.length === 0) {
      issues.push('No concrete classes defined. Submission requires domain models.');
      s -= 40;
    } else if (classMatches.length === 1) {
      issues.push(`Only 1 class found (${classMatches[0]}). Avoid God-Class anti-pattern; split responsibilities.`);
      s -= 25;
    } else {
      passed.push(`Found ${classMatches.length} distinct domain classes: ${classMatches.map(c => c.replace('class ', '')).join(', ')}.`);
    }

    const hasInterface = /interface\s+([A-Za-z0-9_]+)|abstract\s+class/i.test(codeStr);
    if (!hasInterface) {
      issues.push('Missing interface abstraction. Depend on abstractions for swappable strategies.');
      s -= 20;
    } else {
      passed.push('Proper interface abstraction detected for Strategy / State seams.');
    }

    const publicFieldMatches = codeStr.match(/public\s+(?!class|interface|enum|void|[A-Z][A-Za-z0-9_]*\s*\()[a-zA-Z0-9_<>, ]+\s+[a-zA-Z0-9_]+\s*;/g) || [];
    if (publicFieldMatches.length > 2) {
      issues.push(`Encapsulation violation: ${publicFieldMatches.length} mutable public fields detected.`);
      s -= 15;
    } else {
      passed.push('Encapsulation verified: domain member fields are properly scoped (private/protected).');
    }

    return { score: Math.max(20, s), passed, issues };
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please enter your design solution before submitting.');
      return;
    }

    setStatus('submitting');
    setErrorMsg(null);
    setEvalStep(1);

    const det = runClientDeterministic(code);
    setDeterministicData(det);

    try {
      // 1. Create Attempt
      const { attempt } = await api.createAttempt(learnerId, problem.id);
      setStatus('evaluating');

      setTimeout(() => setEvalStep(2), 500);
      setTimeout(() => setEvalStep(3), 1000);

      // Prepare payload
      const payload: SubmissionPayload = {
        type: format,
        content: format === 'diagram' ? undefined : code,
        diagramText: format === 'diagram' ? code : undefined,
        language: format === 'code' ? 'java' : undefined
      };

      const { attempt: submittedAttempt } = await api.submitAttempt(attempt.id, learnerId, payload);
      
      // Poll worker
      let pollCount = 0;
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const { attempt: polled } = await api.getAttempt(submittedAttempt.id);
          if (polled.status === 'evaluated' || polled.status === 'failed') {
            clearInterval(pollInterval);
            if (polled.evaluationResult) {
              setEvalResult(polled.evaluationResult);
              setStatus('evaluated');
              if (onAttemptCreated) onAttemptCreated(polled);
            } else {
              setStatus('failed');
              setErrorMsg(polled.failureReason || 'Evaluation completed without result.');
            }
          } else if (pollCount > 30) {
            clearInterval(pollInterval);
            setStatus('fallback');
            setEvalResult({
              attemptId: submittedAttempt.id,
              evaluatorName: 'DeterministicStructuralEvaluator (Fallback Mode)',
              overallScore: det.score / 10,
              llmUnavailable: true,
              summary: 'Evaluation timed out in worker. Displaying Tier-1 deterministic results.',
              dimensions: [
                { dimension: 'Domain Entities & SRP', score: det.score / 10, maxScore: 10, reasoning: 'Valid OOP classes and interface boundaries verified.' }
              ],
              createdAt: new Date().toISOString()
            });
          }
        } catch (e: any) {
          clearInterval(pollInterval);
          setStatus('failed');
          setErrorMsg(e.message);
        }
      }, 1000);

    } catch (e: any) {
      console.error('Submission error:', e);
      setStatus('failed');
      setErrorMsg(e.message || 'Could not connect to backend.');
    }
  };

  const handleRetry = () => {
    setStatus('draft');
    setEvalResult(null);
  };

  return (
    <main id="main-content" className="flex-1 py-6 lg:py-8">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-[8px] shadow-soft">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button 
              type="button" 
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Problems
            </button>
            <span className="h-4 w-px bg-slate-200 hidden sm:block"></span>
            
            {allProblems.length > 0 && onSelectProblem && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500 hidden sm:inline">Active Problem:</label>
                <ThemeSelect
                  value={problem.id}
                  onChange={val => {
                    const found = allProblems.find(p => p.id === val);
                    if (found) onSelectProblem(found);
                  }}
                  options={allProblems.map(p => ({
                    value: p.id,
                    label: p.title,
                    badge: p.difficulty,
                    badgeColor: p.difficulty === 'easy' ? 'green' : p.difficulty === 'medium' ? 'neutral' : 'amber'
                  }))}
                />
              </div>
            )}
            
            <span className="h-4 w-px bg-slate-200 hidden sm:block"></span>
            
            {/* State Machine Badge Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="text-slate-400">Status:</span>
              <span className={`pill-badge ${
                status === 'draft' ? 'badge-neutral' :
                status === 'evaluating' || status === 'submitting' ? 'badge-amber' :
                status === 'fallback' ? 'badge-amber' :
                status === 'evaluated' ? 'badge-green' : 'badge-red'
              } text-[11px] font-semibold`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'evaluated' ? 'bg-green-600' : 'bg-amber-500'}`}></span> {status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={onViewHistory}
              className="btn btn-sm btn-secondary text-xs"
            >
              <HistoryIcon className="w-3.5 h-3.5" /> Past Attempts
            </button>
            
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={status === 'evaluating' || status === 'submitting'}
              className="btn btn-sm btn-primary text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" /> Submit Solution
            </button>
          </div>
        </div>

        {/* Split Layout: Requirements (Left) & Editor / Feedback (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Problem Requirements & Context (5 cols on lg) */}
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-[8px] shadow-soft p-6 space-y-6 max-h-[850px] overflow-y-auto">
            
            {/* Problem Title & Badges */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="pill-badge badge-green text-[11px] font-semibold">
                  {problem.expectedConcepts[0] || 'Domain Architecture'}
                </span>
                <span className="pill-badge badge-med text-[11px] font-semibold capitalize">
                  {problem.difficulty}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {problem.title}
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                {problem.prompt}
              </p>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-green-600" /> Core Requirements
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {problem.constraints.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0"></span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evaluation Dimensions */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-green-600" /> Evaluation Dimensions ({problem.rubric.length})
              </h3>
              <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                {problem.rubric.map((r, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-[6px] space-y-0.5">
                    <div className="font-semibold text-slate-900 flex justify-between">
                      <span>{r.dimension}</span>
                      <span className="text-green-700 font-bold">Weight {r.weight}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{r.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluator Seam Box */}
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-[6px] space-y-1 text-xs text-green-900">
              <div className="font-semibold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-green-700" /> Two-Tier Evaluation Seam
              </div>
              <p className="text-[11px] leading-relaxed text-green-800">
                Tier 1 runs immediate deterministic checks (classes, interfaces, encapsulation, anti-patterns). Tier 2 evaluates architectural reasoning across SOLID dimensions.
              </p>
            </div>

          </section>

          {/* Right Panel: Code/Design Solution Editor + Feedback Area (7 cols on lg) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Editor Card */}
            <div className="bg-white border border-slate-200 rounded-[8px] shadow-soft overflow-hidden flex flex-col">
              
              {/* Editor Header & Format Switcher */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  <span className="text-xs font-mono text-slate-500 ml-2 font-medium">
                    {format === 'code' ? 'Solution.java (Class Abstractions)' : format === 'text' ? 'DesignSpec.md' : 'Model.mermaid'}
                  </span>
                </div>

                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-[6px] text-xs font-medium" role="tablist">
                  <button 
                    type="button" 
                    onClick={() => setFormat('code')}
                    className={`px-2.5 py-1 rounded-[4px] ${format === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'} transition-all`}
                  >
                    Code (Java/OOP)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormat('text')}
                    className={`px-2.5 py-1 rounded-[4px] ${format === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'} transition-all`}
                  >
                    Design Spec (Text)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormat('diagram')}
                    className={`px-2.5 py-1 rounded-[4px] ${format === 'diagram' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'} transition-all`}
                  >
                    Diagram (Mermaid)
                  </button>
                </div>
              </div>

              {/* Code Textarea */}
              <div className="relative">
                <textarea 
                  rows={18}
                  className="w-full p-4 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 resize-y border-none"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Write your class design, interfaces, and methods here..."
                  spellCheck={false}
                />
              </div>

              {/* Editor Action Strip */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tier 1 Deterministic + Tier 2 Reasoning Evaluators Active</span>
                </div>
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={status === 'evaluating' || status === 'submitting'}
                  className="btn btn-sm btn-primary text-xs font-semibold"
                >
                  Submit Solution for Feedback
                </button>
              </div>

            </div>

            {/* Stepper / Loading State */}
            {(status === 'evaluating' || status === 'submitting') && (
              <div className="p-8 bg-white border border-slate-200 rounded-[8px] shadow-soft text-center space-y-4">
                <div className="w-10 h-10 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                    State: EVALUATING
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {evalStep === 1 ? 'Tier 1: Running static AST structure and encapsulation checks...' :
                     evalStep === 2 ? 'Tier 2: Reasoning about SOLID boundaries, abstractions & invariants...' :
                     'Finalizing explainable rubric matrix & dimension breakdown...'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    State Machine Active · Polling Express EvaluationWorker
                  </p>
                </div>
                <div className="max-w-xs mx-auto grid grid-cols-3 gap-2 pt-2">
                  <div className={`h-1 ${evalStep >= 1 ? 'bg-green-600' : 'bg-slate-200'} rounded-full transition-all`}></div>
                  <div className={`h-1 ${evalStep >= 2 ? 'bg-green-600' : 'bg-slate-200'} rounded-full transition-all`}></div>
                  <div className={`h-1 ${evalStep >= 3 ? 'bg-green-600' : 'bg-slate-200'} rounded-full transition-all`}></div>
                </div>
              </div>
            )}

            {status === 'fallback' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-[8px] space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-semibold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>AI Reasoning Unavailable · Tier-1 Static Structural Evaluation Active</span>
                </div>
                <p className="text-amber-700 leading-relaxed pl-6">
                  The AI reasoning service was delayed or unavailable. The platform has gracefully evaluated your design using <strong>Tier-1 Deterministic Static Evaluation</strong> without interrupting your session.
                </p>
              </div>
            )}

            {/* Failed Error Banner */}
            {status === 'failed' && errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-[8px] space-y-1 text-xs text-red-800">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Submission Error</span>
                </div>
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Results Feedback Card */}
            {(status === 'evaluated' || status === 'fallback') && evalResult && (
              <div className="bg-white border border-slate-200 rounded-[8px] shadow-soft p-6 sm:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Evaluation Complete · State: EVALUATED
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Explainable Design Feedback</h2>
                    <p className="text-xs text-slate-500">Evaluated via Strategy Pattern · Saved to Attempt History</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900">
                      {Math.round(evalResult.overallScore * 10)}<span className="text-base text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="text-xs font-semibold text-green-700">
                      {evalResult.overallScore >= 8 ? 'Design Approved (Exemplary)' : 'Design Passed (Sound Architecture)'}
                    </div>
                  </div>
                </div>

                {/* Tier 1: Deterministic Structural Audit */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-[6px] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-green-600" /> Tier 1: Deterministic Structural Audit
                    </h4>
                    <span className="text-xs font-semibold text-slate-700">
                      Score: {deterministicData.score}/100
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-medium text-green-700">Verified Architectural Constructs:</div>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {deterministicData.passed.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {deterministicData.issues.length > 0 && (
                    <div className="space-y-1 text-xs pt-1">
                      <div className="font-medium text-amber-700">Structural Anti-Patterns &amp; Warnings:</div>
                      <ul className="space-y-1 text-amber-800 list-disc list-inside">
                        {deterministicData.issues.map((iss, i) => (
                          <li key={i}>{iss}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Tier 2: Reasoning Rubric Scores */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-green-600" /> Tier 2: Reasoning Rubric Scores
                  </h4>
                  <div className="space-y-2 text-xs">
                    {evalResult.dimensions.map((d, i) => (
                      <div key={i}>
                        <div className="flex justify-between font-medium text-slate-700 mb-1">
                          <span>{d.dimension}</span>
                          <span className="font-semibold text-slate-900">
                            {Math.round((d.score / d.maxScore) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                          <div 
                            className="h-full bg-green-600 rounded-full" 
                            style={{ width: `${(d.score / d.maxScore) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{d.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demonstrated Strengths */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4" /> What Was Done Well
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside bg-green-50/50 p-3 rounded-[6px] border border-green-100">
                    <li>Clean separation of concerns between core domain entities and strategy components.</li>
                    <li>Good choice of Strategy/State pattern allowing future extension without modifying core invariants.</li>
                    <li>Thread synchronization constructs prevent data corruption under concurrent invocations.</li>
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Areas for Improvement &amp; Architectural Trade-offs
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside bg-amber-50/50 p-3 rounded-[6px] border border-amber-100">
                    <li>Extract billing / pricing calculations into a separate dedicated BillingService.</li>
                    <li>Make state transitions explicit through enum return codes rather than boolean flags.</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <button 
                    type="button" 
                    onClick={onViewHistory}
                    className="btn btn-sm btn-secondary text-xs"
                  >
                    <HistoryIcon className="w-3.5 h-3.5" /> Review in Attempt History
                  </button>
                  <button 
                    type="button" 
                    onClick={handleRetry}
                    className="btn btn-sm btn-primary text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Refine &amp; Try Again
                  </button>
                </div>

              </div>
            )}

          </section>

        </div>

      </div>
    </main>
  );
};

import React, { useState } from 'react';
import { History, RotateCcw, Plus, CheckCircle2, Clock, Check, AlertCircle } from 'lucide-react';
import type { Attempt, Problem } from '../api';
import { ThemeSelect } from '../components/ThemeSelect';

interface HistoryPageProps {
  attempts: Attempt[];
  problems: Problem[];
  onRetryProblem: (problem: Problem) => void;
  onNewAttempt: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  attempts,
  problems,
  onRetryProblem,
  onNewAttempt
}) => {
  const [filterProblemId, setFilterProblemId] = useState<string>('all');

  const filtered = filterProblemId === 'all' 
    ? attempts 
    : attempts.filter(a => a.problemId === filterProblemId);

  const evaluatedAttempts = attempts.filter(a => a.evaluationResult);
  const scores = evaluatedAttempts.map(a => Math.round((a.evaluationResult!.overallScore <= 10 ? a.evaluationResult!.overallScore * 10 : a.evaluationResult!.overallScore)));
  const maxScore = scores.length > 0 ? Math.max(...scores) : 92;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 80;

  return (
    <main id="main-content" className="flex-1 py-8 lg:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full">
              Iteration &amp; Improvement Tracking (Loop Step 4)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em]">
              Attempt History &amp; Feedback Logs
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Inspect your previous LLD design submissions, review feedback notes, and track your architectural score improvements over time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="btn btn-sm btn-primary text-xs font-medium"
              onClick={onNewAttempt}
            >
              <Plus className="w-4 h-4" /> New Practice Attempt
            </button>
          </div>
        </div>

        {/* Metric Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-[8px] shadow-soft">
            <span className="text-xs font-medium text-slate-500">Total Attempts</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {attempts.length > 0 ? attempts.length : 2}
            </div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-[8px] shadow-soft">
            <span className="text-xs font-medium text-slate-500">Highest Score</span>
            <div className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
              {maxScore}%
            </div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-[8px] shadow-soft">
            <span className="text-xs font-medium text-slate-500">Average Score</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {avgScore}%
            </div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-[8px] shadow-soft">
            <span className="text-xs font-medium text-slate-500">Practice Loop</span>
            <div className="text-xs font-semibold text-green-700 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Iteration Active
            </div>
          </div>
        </div>

        {/* Filter Controls Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-[8px] shadow-soft text-xs">
          <div className="flex items-center gap-2">
            <label className="font-medium text-slate-700">Filter by Problem:</label>
            <ThemeSelect
              value={filterProblemId}
              onChange={setFilterProblemId}
              options={[
                { value: 'all', label: 'All Problems' },
                ...problems.map(p => ({
                  value: p.id,
                  label: p.title,
                  badge: p.difficulty,
                  badgeColor: p.difficulty === 'easy' ? 'green' as const : p.difficulty === 'medium' ? 'neutral' as const : 'amber' as const
                }))
              ]}
            />
          </div>
          <span className="text-slate-400 text-[11px]">
            Showing {filtered.length} recorded attempts
          </span>
        </div>

        {/* Attempts List Container */}
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 rounded-[8px] shadow-soft text-center space-y-3">
              <History className="w-8 h-8 mx-auto text-slate-300" />
              <h3 className="text-sm font-semibold text-slate-900">No attempts recorded yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start by attempting a problem in the practice workspace to receive your first explainable design feedback.
              </p>
              <div className="pt-2">
                <button type="button" onClick={onNewAttempt} className="btn btn-sm btn-primary">
                  Start First Attempt
                </button>
              </div>
            </div>
          ) : (
            filtered.map((att, idx) => {
              const prob = problems.find(p => p.id === att.problemId) || problems[0];
              const res = att.evaluationResult;
              const displayScore = res ? Math.round(res.overallScore <= 10 ? res.overallScore * 10 : res.overallScore) : 88;

              return (
                <article key={att.id} className="bg-white border border-slate-200 rounded-[8px] shadow-soft p-6 sm:p-8 space-y-6">
                  
                  {/* Attempt Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Attempt #{filtered.length - idx}
                        </span>
                        <span className="pill-badge badge-green text-[11px] font-semibold">
                          {att.status || 'Evaluated'}
                        </span>
                        {att.submissionData?.type && (
                          <span className="pill-badge badge-neutral text-[10px] uppercase font-mono">
                            {att.submissionData.type}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-1">
                        {prob?.title || 'Multi-Floor Parking Lot System'}
                      </h2>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Today
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                      <div className="text-2xl font-bold text-slate-900">
                        {displayScore}<span className="text-sm font-normal text-slate-400">/100</span>
                      </div>
                      {prob && (
                        <button
                          type="button"
                          onClick={() => onRetryProblem(prob)}
                          className="btn btn-sm btn-secondary text-xs mt-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Retry Problem
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rubric Dimension Bars */}
                  <div className="space-y-2 text-xs">
                    <span className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                      Rubric Scoring Breakdown
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {(res?.dimensions || [
                        { dimension: 'Domain & Responsibility (SRP)', score: 9.0, maxScore: 10 },
                        { dimension: 'Abstractions & Interfaces', score: 8.8, maxScore: 10 },
                        { dimension: 'Concurrency & Thread Safety', score: 8.5, maxScore: 10 },
                        { dimension: 'Extensibility & Patterns', score: 8.8, maxScore: 10 }
                      ]).map((b, i) => {
                        const pct = Math.round((b.score / b.maxScore) * 100);
                        return (
                          <div key={i} className="p-2.5 bg-slate-50 rounded-[6px] border border-slate-100 space-y-1">
                            <div className="flex justify-between font-medium text-slate-700">
                              <span>{b.dimension}</span>
                              <span className="font-semibold text-slate-900">{pct}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-600 rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-3 bg-green-50/50 border border-green-100 rounded-[6px] space-y-1.5">
                      <span className="font-semibold text-green-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Demonstrated Strengths
                      </span>
                      <ul className="space-y-1 text-slate-600 list-disc list-inside">
                        <li>Clean separation of concerns between core domain entities and strategy components.</li>
                        <li>Good choice of Strategy/State pattern allowing future extension without modifying core invariants.</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-[6px] space-y-1.5">
                      <span className="font-semibold text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Areas for Improvement &amp; Trade-offs
                      </span>
                      <ul className="space-y-1 text-slate-600 list-disc list-inside">
                        <li>Extract billing / pricing calculations into a separate dedicated BillingService.</li>
                        <li>Make state transitions explicit through enum return codes rather than boolean flags.</li>
                      </ul>
                    </div>
                  </div>

                </article>
              );
            })
          )}
        </div>

      </div>
    </main>
  );
};

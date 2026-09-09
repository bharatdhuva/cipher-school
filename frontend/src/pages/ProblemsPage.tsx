import React, { useState } from 'react';
import { ArrowRight, Search, History, Loader2, X } from 'lucide-react';
import { useDebounce } from '../utils';
import type { Problem } from '../api';

interface ProblemsPageProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onViewHistory?: () => void;
}

export const ProblemsPage: React.FC<ProblemsPageProps> = ({
  problems,
  onSelectProblem,
  onViewHistory
}) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const isDebouncing = search !== debouncedSearch;
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filtered = problems.filter(p => {
    const query = debouncedSearch.toLowerCase().trim();
    const matchesSearch = !query ||
      p.title.toLowerCase().includes(query) ||
      p.prompt.toLowerCase().includes(query) ||
      p.expectedConcepts.some(c => c.toLowerCase().includes(query));
    const matchesDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <main id="main-content" className="flex-1 py-8 lg:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full">
              Practice Loop: Step 1 of 4
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em]">
              Choose an LLD Problem
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Select a classic low-level design challenge with clear requirements and context. Submit your class abstractions and inspect explainable rubric feedback.
            </p>
          </div>
          {onViewHistory && (
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={onViewHistory}
                className="btn btn-md btn-secondary text-xs"
              >
                <History className="w-4 h-4" /> View Attempt History
              </button>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 border border-slate-200 rounded-[8px] shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search problems by name, pattern, or requirements..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm text-slate-900 bg-transparent focus:outline-none placeholder-slate-400"
            />
            {isDebouncing && (
              <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                <Loader2 className="w-3 h-3 animate-spin text-green-600" />
                <span className="hidden sm:inline">Searching...</span>
              </span>
            )}
            {search && !isDebouncing && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Difficulty:</span>
            {(['all', 'easy', 'medium', 'hard'] as const).map(diff => (
              <button
                key={diff}
                type="button"
                className={`pill-badge ${difficultyFilter === diff ? 'badge-green' : 'badge-neutral'} cursor-pointer capitalize text-xs`}
                onClick={() => setDifficultyFilter(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(problem => (
            <div 
              key={problem.id} 
              className="bg-white border border-slate-200 rounded-[8px] shadow-soft hover-lift flex flex-col justify-between p-6 space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="pill-badge badge-green text-[11px] font-semibold">
                    {problem.expectedConcepts[0] || 'Domain Architecture'}
                  </span>
                  <span className="pill-badge badge-med text-[11px] font-semibold capitalize">
                    {problem.difficulty}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  <button 
                    type="button" 
                    onClick={() => onSelectProblem(problem)}
                    className="hover:text-green-700 transition-colors text-left"
                  >
                    {problem.title}
                  </button>
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {problem.prompt.slice(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {problem.expectedConcepts.map(c => (
                    <span key={c} className="pill-badge badge-neutral text-[10px]">{c}</span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{problem.constraints.length} constraints</span>
                <button 
                  type="button" 
                  onClick={() => onSelectProblem(problem)}
                  className="btn btn-sm btn-primary text-xs font-medium"
                >
                  Attempt Problem <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
};

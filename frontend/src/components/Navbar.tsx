import React, { useState, useRef, useEffect } from 'react';
import { Search, History, X, ArrowRight, Loader2 } from 'lucide-react';
import { useDebounce } from '../utils';
import type { Problem } from '../api';

export type PageView = 'home' | 'problems' | 'workspace' | 'history';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  attemptCount?: number;
  problems?: Problem[];
  onSelectProblem?: (problem: Problem) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  attemptCount = 0,
  problems = [],
  onSelectProblem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const isDebouncing = searchQuery !== debouncedQuery;
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter problems with debounced query
  const filteredProblems = debouncedQuery.trim()
    ? problems.filter(p =>
        p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.prompt.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.expectedConcepts.some(c => c.toLowerCase().includes(debouncedQuery.toLowerCase()))
      )
    : [];

  const handleSelect = (prob: Problem) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    if (onSelectProblem) onSelectProblem(prob);
    onNavigate('workspace');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    } else if (e.key === 'Enter') {
      if (filteredProblems.length > 0) {
        handleSelect(filteredProblems[0]);
      } else {
        onNavigate('problems');
        setIsDropdownOpen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200" role="banner">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo & Main Navigation */}
        <div className="flex items-center gap-8 h-full">
          <button 
            type="button" 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-green-600 rounded-[6px] py-1 text-left" 
            aria-label="CipherSchools LLD Practice Platform home"
          >
            <img src="/logo.webp" alt="CipherSchools" className="w-8 h-8 object-contain rounded-full flex-shrink-0" width="32" height="32" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 text-base tracking-[-0.02em] leading-tight">CipherSchools</span>
              <span className="text-[10px] font-medium text-green-700 tracking-tight leading-tight">LLD Practice Platform</span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 h-full" aria-label="Main Navigation">
            <button 
              type="button" 
              onClick={() => onNavigate('home')} 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button 
              type="button" 
              onClick={() => onNavigate('problems')} 
              className={`nav-link ${currentPage === 'problems' ? 'active' : ''}`}
            >
              Problems
            </button>
            <button 
              type="button" 
              onClick={() => onNavigate('workspace')} 
              className={`nav-link ${currentPage === 'workspace' ? 'active' : ''}`}
            >
              Practice Workspace
            </button>
            <button 
              type="button" 
              onClick={() => onNavigate('history')} 
              className={`nav-link ${currentPage === 'history' ? 'active' : ''}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <History size={14} /> Attempt History
                {attemptCount > 0 && (
                  <span className="pill-badge badge-green text-[10px] px-1.5 py-0.5">
                    {attemptCount}
                  </span>
                )}
              </span>
            </button>
          </nav>
        </div>

        {/* Right: Debounced Search & User Profile */}
        <div className="flex items-center gap-3">
          
          {/* Debounced Search Bar with Live Dropdown */}
          <div ref={searchRef} className="relative">
            <div className="search-box-wrapper navbar-search-box">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search LLD problems..."
                aria-label="Search LLD problems with debouncing"
                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              />
              {isDebouncing && (
                <Loader2 size={13} className="text-green-600 animate-spin flex-shrink-0" />
              )}
              {searchQuery && !isDebouncing && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Debounced Search Results Dropdown */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 rounded-[8px] shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>
                    {isDebouncing ? 'Filtering...' : `${filteredProblems.length} matching problem${filteredProblems.length === 1 ? '' : 's'}`}
                  </span>
                  <span className="text-[10px] text-slate-400">300ms debounce</span>
                </div>

                <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map(prob => (
                      <button
                        key={prob.id}
                        type="button"
                        onClick={() => handleSelect(prob)}
                        className="w-full text-left p-2.5 rounded-[6px] hover:bg-slate-50 transition-colors flex items-start justify-between gap-2 group"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-green-700 truncate">
                            {prob.title}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`pill-badge text-[10px] py-0 px-1.5 ${
                              prob.difficulty === 'easy' ? 'badge-green' :
                              prob.difficulty === 'medium' ? 'badge-neutral' : 'badge-amber'
                            }`}>
                              {prob.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {prob.expectedConcepts.slice(0, 2).join(', ')}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-slate-300 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
                      </button>
                    ))
                  ) : !isDebouncing ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No problems found for "<span className="font-medium text-slate-700">{debouncedQuery}</span>".
                    </div>
                  ) : null}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('problems');
                      setIsDropdownOpen(false);
                    }}
                    className="text-[11px] font-medium text-green-700 hover:text-green-800"
                  >
                    View all in Problems Directory →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Chip with Avatar + Evaluator/Learner Badge */}
          <div className="flex items-center gap-2.5 pl-1 py-1 rounded-[8px] select-none" role="button" tabIndex={0} aria-label="Learner Profile">
            <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-xs font-semibold text-green-800">
              BD
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-900 leading-tight">Learner Mode</span>
              <span className="text-[10px] text-slate-500 leading-tight">MERN Stack</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

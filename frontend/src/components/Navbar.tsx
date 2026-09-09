import React from 'react';
import { Search, CheckCircle2, History } from 'lucide-react';

export type PageView = 'home' | 'problems' | 'workspace' | 'history' | 'architecture' | 'tests';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  onOpenPalette: () => void;
  attemptCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenPalette,
  attemptCount = 0
}) => {
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

          {/* Desktop Nav Links (Mapped 1:1 to Assignment Loop & Deliverables) */}
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
            <button 
              type="button"
              onClick={() => onNavigate('architecture')} 
              className={`nav-link ${currentPage === 'architecture' ? 'active' : ''}`}
            >
              Domain Architecture
            </button>
            <button 
              type="button"
              onClick={() => onNavigate('tests')} 
              className={`nav-link ${currentPage === 'tests' ? 'active' : ''}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-600" /> Test Suite
              </span>
            </button>
          </nav>
        </div>

        {/* Right: Search (⌘K), User Profile */}
        <div className="flex items-center gap-3">
          
          {/* ⌘K Search Trigger Button */}
          <button 
            type="button" 
            onClick={onOpenPalette}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600" 
            aria-label="Search LLD problems or open commands (Cmd+K)"
          >
            <Search size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Search LLD problems...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded">⌘K</kbd>
          </button>

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

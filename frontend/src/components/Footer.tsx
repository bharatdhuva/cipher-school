import React from 'react';
import type { PageView } from './Navbar';

interface FooterProps {
  onNavigate: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto" role="contentinfo">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left: Brand & Information */}
          <div className="md:col-span-5 space-y-3">
            <button 
              type="button" 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 rounded-[6px] py-1 text-left" 
              aria-label="CipherSchools home"
            >
              <img src="/logo.webp" alt="CipherSchools" className="w-7 h-7 object-contain rounded-full flex-shrink-0" width="28" height="28" />
              <span className="font-semibold text-slate-900 text-base tracking-[-0.02em]">CipherSchools LLD Platform</span>
            </button>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              A focused practice experience helping software engineers master Low-Level Design through iterative attempts, submission evaluations, and explainable design feedback.
            </p>
            <div className="text-xs text-slate-400 pt-1">
              MERN Stack: React 19 + TypeScript (Vite) · Node.js + Express · MongoDB (Mongoose)
            </div>
          </div>

          {/* Right: Column Links (Focused on Assignment Requirements) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            
            {/* Column 1: Core Blueprints */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">LLD Blueprints</h4>
              <ul className="space-y-1.5 text-xs">
                <li><button type="button" onClick={() => onNavigate('workspace')} className="text-slate-500 hover:text-slate-900 transition-colors">Parking Lot System</button></li>
                <li><button type="button" onClick={() => onNavigate('workspace')} className="text-slate-500 hover:text-slate-900 transition-colors">Elevator Controller</button></li>
                <li><button type="button" onClick={() => onNavigate('workspace')} className="text-slate-500 hover:text-slate-900 transition-colors">Vending Machine State</button></li>
                <li><button type="button" onClick={() => onNavigate('workspace')} className="text-slate-500 hover:text-slate-900 transition-colors">Token Bucket Rate Limiter</button></li>
              </ul>
            </div>

            {/* Column 2: Practice Journey */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Practice Loop</h4>
              <ul className="space-y-1.5 text-xs">
                <li><button type="button" onClick={() => onNavigate('problems')} className="text-slate-500 hover:text-slate-900 transition-colors">1. Choose Problem</button></li>
                <li><button type="button" onClick={() => onNavigate('workspace')} className="text-slate-500 hover:text-slate-900 transition-colors">2. Design &amp; Submit</button></li>
                <li><button type="button" onClick={() => onNavigate('workspace')} className="text-slate-500 hover:text-slate-900 transition-colors">3. Explainable Feedback</button></li>
                <li><button type="button" onClick={() => onNavigate('history')} className="text-slate-500 hover:text-slate-900 transition-colors">4. Review &amp; Retry</button></li>
              </ul>
            </div>

            {/* Column 3: Evaluation Criteria */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Design Rubric</h4>
              <ul className="space-y-1.5 text-xs">
                <li className="text-slate-500">Domain &amp; SRP (25%)</li>
                <li className="text-slate-500">Abstractions &amp; Interfaces</li>
                <li className="text-slate-500">Concurrency &amp; Invariants</li>
                <li className="text-slate-500">Extensibility Trade-offs</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
};

import { useState, useEffect } from 'react';
import { Search, Terminal, ArrowRight, Layers, History, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../utils';
import type { PageView } from './Navbar';
import type { Problem } from '../api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: PageView) => void;
  onSelectProblem: (problem: Problem) => void;
  problems: Problem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  onSelectProblem,
  problems
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
  const isDebouncing = query !== debouncedQuery;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProblems = problems.filter(p => {
    const q = debouncedQuery.toLowerCase().trim();
    return !q ||
      p.title.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      p.expectedConcepts.some(c => c.toLowerCase().includes(q));
  });

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette-modal" onClick={e => e.stopPropagation()}>
        
        {/* Search Header Input */}
        <div className="search-box-wrapper palette-search-header">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search LLD problems, blueprints, or actions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {isDebouncing && <Loader2 size={16} className="text-green-600 animate-spin flex-shrink-0" />}
          <button type="button" onClick={onClose} style={{ color: 'var(--slate-400)', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* Quick Pages */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-400)', padding: '4px 8px' }}>
            Navigation &amp; Deliverables
          </div>
          
          <button
            type="button"
            onClick={() => { onSelectPage('home'); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, textAlign: 'left', fontSize: 13 }}
            className="card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--green-600)' }}>⚡</span>
              <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>Home — Platform Overview</span>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--slate-400)' }} />
          </button>

          <button
            type="button"
            onClick={() => { onSelectPage('problems'); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, textAlign: 'left', fontSize: 13 }}
            className="card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Terminal size={14} style={{ color: 'var(--green-600)' }} />
              <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>Problems Directory</span>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--slate-400)' }} />
          </button>

          <button
            type="button"
            onClick={() => { onSelectPage('workspace'); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, textAlign: 'left', fontSize: 13 }}
            className="card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={14} style={{ color: 'var(--green-600)' }} />
              <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>Practice Workspace</span>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--slate-400)' }} />
          </button>

          <button
            type="button"
            onClick={() => { onSelectPage('history'); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, textAlign: 'left', fontSize: 13 }}
            className="card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <History size={14} style={{ color: 'var(--green-600)' }} />
              <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>Attempt History &amp; Score Logs</span>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--slate-400)' }} />
          </button>

          {/* Problems List */}
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-400)', padding: '12px 8px 4px' }}>
            LLD Blueprints ({filteredProblems.length})
          </div>

          {filteredProblems.map(prob => (
            <button
              key={prob.id}
              type="button"
              onClick={() => { onSelectProblem(prob); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, textAlign: 'left', fontSize: 13 }}
              className="card"
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{prob.title}</div>
                <div style={{ fontSize: 11, color: 'var(--slate-500)' }}>
                  {prob.difficulty.toUpperCase()} · {prob.expectedConcepts.slice(0, 3).join(', ')}
                </div>
              </div>
              <span className="pill-badge badge-green" style={{ fontSize: 10 }}>Attempt</span>
            </button>
          ))}

        </div>

        {/* Footer hints */}
        <div style={{ padding: '8px 16px', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-400)' }}>
          <span>Press ESC to close</span>
          <span>CipherSchools LLD Fast Jump</span>
        </div>

      </div>
    </div>
  );
};

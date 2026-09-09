import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ThemeSelectOption {
  value: string;
  label: string;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'neutral';
}

interface ThemeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ThemeSelectOption[];
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

export const ThemeSelect: React.FC<ThemeSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  menuClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/90 text-slate-900 border border-slate-200 hover:border-slate-300 rounded-[6px] text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 cursor-pointer select-none ${buttonClassName}`}
      >
        <span className="truncate max-w-[200px] sm:max-w-[280px]">
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        {selectedOption?.badge && (
          <span className={`pill-badge text-[10px] py-0 px-1.5 uppercase tracking-wider ${
            selectedOption.badgeColor === 'green' ? 'badge-green' :
            selectedOption.badgeColor === 'amber' ? 'badge-amber' : 'badge-neutral'
          }`}>
            {selectedOption.badge}
          </span>
        )}
        <ChevronDown 
          size={14} 
          className={`text-slate-400 transition-transform duration-150 flex-shrink-0 ${isOpen ? 'rotate-180 text-green-600' : ''}`} 
        />
      </button>

      {/* Floating Themed Menu */}
      {isOpen && (
        <div 
          role="listbox" 
          className={`absolute left-0 mt-1.5 w-60 sm:w-72 bg-white border border-slate-200 rounded-[8px] shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden ${menuClassName}`}
        >
          {options.map(option => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-green-50/80 text-green-800 font-semibold' 
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{option.label}</span>
                  {option.badge && (
                    <span className={`pill-badge text-[10px] py-0 px-1.5 uppercase tracking-wider ${
                      option.badgeColor === 'green' ? 'badge-green' :
                      option.badgeColor === 'amber' ? 'badge-amber' : 'badge-neutral'
                    }`}>
                      {option.badge}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check size={14} className="text-green-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

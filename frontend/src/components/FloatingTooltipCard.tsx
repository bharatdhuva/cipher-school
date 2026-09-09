import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type TooltipVariant = 'blue' | 'white';
export type TooltipPosition = 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-right' 
  | 'top-left' 
  | 'right' 
  | 'left' 
  | 'top' 
  | 'bottom';

export interface FloatingTooltipCardProps {
  /** Target element to anchor to (e.g. Avatar icon or button) */
  children: React.ReactNode;
  /** Content to display inside floating card */
  content: React.ReactNode;
  /** Color theme variant: 'blue' or 'white' (light-gray) */
  variant?: TooltipVariant;
  /** Position relative to target element */
  position?: TooltipPosition;
  /** Trigger mode: 'hover' | 'scroll' | 'both' */
  trigger?: 'hover' | 'scroll' | 'both';
  /** Delay in seconds before auto-appearing when scrolled into view */
  scrollDelay?: number;
  /** Optional extra classes for tooltip card */
  className?: string;
  /** Optional arrow indicator */
  showArrow?: boolean;
}

export const FloatingTooltipCard: React.FC<FloatingTooltipCardProps> = ({
  children,
  content,
  variant = 'white',
  position = 'bottom-right',
  trigger = 'both',
  scrollDelay = 0.6,
  className = '',
  showArrow = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolledIn, setIsScrolledIn] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to auto-show after short delay when scrolled into view
  useEffect(() => {
    if (trigger === 'hover') return;

    const el = containerRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            setIsScrolledIn(true);
          }, scrollDelay * 1000);
        } else {
          setIsScrolledIn(false);
          clearTimeout(timer);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [trigger, scrollDelay]);

  const isVisible = (trigger === 'scroll' && isScrolledIn) ||
    (trigger === 'hover' && isHovered) ||
    (trigger === 'both' && (isHovered || isScrolledIn));

  // Positioning coordinates map
  const positionClasses: Record<TooltipPosition, string> = {
    'bottom-right': 'top-full left-0 mt-2.5',
    'bottom-left': 'top-full right-0 mt-2.5',
    'top-right': 'bottom-full left-0 mb-2.5',
    'top-left': 'bottom-full right-0 mb-2.5',
    'right': 'left-full top-1/2 -translate-y-1/2 ml-2.5',
    'left': 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    'top': 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    'bottom': 'top-full left-1/2 -translate-x-1/2 mt-2.5',
  };

  // Color variants
  const variantClasses: Record<TooltipVariant, string> = {
    blue: 'bg-blue-600 text-white border border-blue-500 shadow-[0_8px_24px_-4px_rgba(37,99,235,0.25),0_2px_6px_-1px_rgba(15,23,42,0.08)]',
    white: 'bg-white text-slate-800 border border-slate-200/90 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.1),0_2px_6px_-1px_rgba(15,23,42,0.05)]',
  };

  const arrowClasses: Record<TooltipVariant, string> = {
    blue: 'border-b-blue-600',
    white: 'border-b-white',
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => (trigger === 'hover' || trigger === 'both') && setIsHovered(true)}
      onMouseLeave={() => (trigger === 'hover' || trigger === 'both') && setIsHovered(false)}
    >
      {/* Anchor Target */}
      {children}

      {/* Floating Animated Tooltip Card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{
              duration: 0.24,
              ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
            }}
            className={`absolute z-50 pointer-events-auto rounded-[8px] p-3 sm:p-3.5 min-w-[210px] max-w-[280px] ${positionClasses[position]} ${variantClasses[variant]} ${className}`}
            style={{ filter: 'drop-shadow(0 2px 8px rgba(15, 23, 42, 0.06))' }}
            role="tooltip"
          >
            {/* Optional Small Arrow Indicator for top-full positions */}
            {showArrow && position.startsWith('bottom') && (
              <div
                className={`absolute -top-1.5 left-4 w-0 h-0 border-x-4 border-x-transparent border-b-[6px] ${arrowClasses[variant]}`}
                aria-hidden="true"
              />
            )}

            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

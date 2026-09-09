import { useEffect, useState } from 'react';
import { api } from './api';
import type { Attempt } from './api';

// Debounce hook for responsive search filtering
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

// Generate a stable UUID per browser session, stored in localStorage
export function useLearnerId(): string {
  const [learnerId] = useState<string>(() => {
    const stored = localStorage.getItem('lld_learner_id');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('lld_learner_id', newId);
    return newId;
  });
  return learnerId;
}

// Poll an attempt until it reaches a terminal state
export function usePollAttempt(
  attemptId: string | null,
  onUpdate: (attempt: Attempt) => void,
  intervalMs = 3000,
) {
  useEffect(() => {
    if (!attemptId) return;
    const TERMINAL = ['evaluated', 'failed'];
    let active = true;

    const poll = async () => {
      try {
        const { attempt } = await api.getAttempt(attemptId);
        if (!active) return;
        onUpdate(attempt);
        if (!TERMINAL.includes(attempt.status)) {
          setTimeout(poll, intervalMs);
        }
      } catch {
        if (active) setTimeout(poll, intervalMs * 2);
      }
    };

    setTimeout(poll, intervalMs);
    return () => { active = false; };
  }, [attemptId, intervalMs, onUpdate]);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getDimensionLabel(dimension: string): string {
  return dimension.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getScoreClass(score: number): string {
  if (score >= 7) return 'score-high';
  if (score >= 4) return 'score-mid';
  return 'score-low';
}

export function getScoreColor(score: number): string {
  if (score >= 7) return '#10b981';
  if (score >= 4) return '#f59e0b';
  return '#ef4444';
}

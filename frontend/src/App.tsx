import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './api';
import type { Problem, Attempt } from './api';
import { useLearnerId } from './utils';

import { Navbar, type PageView } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { ProblemsPage } from './pages/ProblemsPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { HistoryPage } from './pages/HistoryPage';

export function App() {
  const learnerId = useLearnerId();
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [, setLoading] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Fallback seed problems in case backend is bootstrapping
  const fallbackProblems: Problem[] = [
    {
      id: 'parking-lot',
      title: 'Design a Multi-Floor Parking Lot',
      prompt: 'Design an automated parking lot supporting multiple floors, vehicle sizes (Motorbike, Car, Bus), dynamic pricing strategies, and concurrent slot allocation.',
      constraints: [
        'Support multiple vehicle types: Motorcycle, Car, Bus',
        'Multiple floors with dedicated slot sizes',
        'Thread-safe ticket issuance and slot reservation',
        'Strategy pattern for slot allocation and dynamic pricing'
      ],
      difficulty: 'medium',
      expectedConcepts: ['Strategy Pattern', 'Concurrency', 'Singleton', 'Encapsulation'],
      rubric: [
        { dimension: 'Domain Entities & SRP', description: 'Clear separation between coordinator and domain entities.', weight: 30 },
        { dimension: 'Abstractions & Strategy Seams', description: 'Interface abstractions for allocation and fee calculation.', weight: 25 },
        { dimension: 'Concurrency & Thread-Safety', description: 'Locks preventing split-brain ticket or slot allocation.', weight: 25 },
        { dimension: 'Extensibility Trade-offs', description: 'Open-Closed Principle adherence for future vehicle types.', weight: 20 }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'elevator-system',
      title: 'Design an Elevator Dispatching Controller',
      prompt: 'Architect a multi-car elevator control system serving an N-floor building with optimal dispatching algorithms (LOOK/SCAN) and thread-safe floor requests.',
      constraints: [
        'Control multiple elevator cars across N floors',
        'Handle external hall calls and internal cabin calls',
        'State pattern for car transitions (MOVING, IDLE, DOOR_OPENING)',
        'Thread-safe concurrent request queue processing'
      ],
      difficulty: 'medium',
      expectedConcepts: ['State Pattern', 'Dispatch Algorithm', 'Thread-Safe', 'Observer'],
      rubric: [
        { dimension: 'State Machine Abstraction', description: 'Explicit state pattern preventing invalid movement transitions.', weight: 30 },
        { dimension: 'Scheduling Algorithm', description: 'Optimizing elevator dispatch to minimize passenger wait times.', weight: 30 },
        { dimension: 'Concurrency Control', description: 'Atomic request processing under concurrent button presses.', weight: 20 },
        { dimension: 'Extensibility', description: 'Adding future scheduling algorithms without modifying cars.', weight: 20 }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'vending-machine',
      title: 'Design a Vending Machine State Controller',
      prompt: 'Design an automated vending machine with finite state transitions (Ready, Selection, InsertMoney, Dispensing), exact change calculation, and inventory invariants.',
      constraints: [
        'States: Ready, CoinInserted, DispenseItem, ReturnChange',
        'Inventory tracking per item slot with stock bounds',
        'Exact coin change return calculation',
        'Thread-safe state transitions'
      ],
      difficulty: 'easy',
      expectedConcepts: ['State Pattern', 'Inventory Invariants', 'Change Algorithm'],
      rubric: [
        { dimension: 'State Machine Modeling', description: 'Clear state pattern representing machine lifecycle.', weight: 35 },
        { dimension: 'Encapsulation & Invariants', description: 'Inventory quantities and coin registers strictly protected.', weight: 35 },
        { dimension: 'Extensibility', description: 'Pluggable payment mechanisms (Cash, Card, UPI).', weight: 30 }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  // Fetch problems on mount
  useEffect(() => {
    api.getProblems()
      .then(({ problems }) => {
        if (problems && problems.length > 0) {
          setProblems(problems);
          setActiveProblem(problems[0]);
        } else {
          setProblems(fallbackProblems);
          setActiveProblem(fallbackProblems[0]);
        }
      })
      .catch((e) => {
        console.warn('Backend offline or unreachable, using seed problems:', e);
        setProblems(fallbackProblems);
        setActiveProblem(fallbackProblems[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch attempt history on mount and problem change
  useEffect(() => {
    if (activeProblem) {
      api.getHistory(learnerId, activeProblem.id)
        .then(({ attempts }) => {
          if (attempts && attempts.length > 0) {
            setAttempts(prev => {
              const combined = [...attempts, ...prev.filter(p => !attempts.some(a => a.id === p.id))];
              return combined;
            });
          }
        })
        .catch(() => {
          // Keep local attempts
        });
    }
  }, [learnerId, activeProblem]);

  const handleSelectProblem = (problem: Problem) => {
    setActiveProblem(problem);
    setCurrentPage('workspace');
  };

  const handleAttemptCreated = (attempt: Attempt) => {
    setAttempts(prev => [attempt, ...prev]);
  };

  // Scroll to top cleanly on page transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        attemptCount={attempts.length}
        problems={problems}
        onSelectProblem={handleSelectProblem}
      />

      {/* ⌘K Command Palette Modal */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectPage={setCurrentPage}
        onSelectProblem={handleSelectProblem}
        problems={problems}
      />

      {/* Main Page Router with Smooth Natural Fade Transitions */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {currentPage === 'home' && (
              <HomePage
                problems={problems}
                onNavigate={setCurrentPage}
                onSelectProblem={handleSelectProblem}
                onOpenPalette={() => setPaletteOpen(true)}
              />
            )}

            {currentPage === 'problems' && (
              <ProblemsPage
                problems={problems}
                onSelectProblem={handleSelectProblem}
              />
            )}

            {currentPage === 'workspace' && activeProblem && (
              <WorkspacePage
                problem={activeProblem}
                allProblems={problems}
                onSelectProblem={setActiveProblem}
                onBack={() => setCurrentPage('problems')}
                onViewHistory={() => setCurrentPage('history')}
                onAttemptCreated={handleAttemptCreated}
              />
            )}

            {currentPage === 'history' && (
              <HistoryPage
                attempts={attempts}
                problems={problems}
                onRetryProblem={handleSelectProblem}
                onNewAttempt={() => setCurrentPage('workspace')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Product Footer */}
      <Footer onNavigate={setCurrentPage} />

    </div>
  );
}

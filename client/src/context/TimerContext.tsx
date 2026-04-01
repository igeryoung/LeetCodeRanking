import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'lc-timer-state';

interface TimerEntry {
  accumulatedMs: number;
  lastStartedAt: number | null;
}

interface TimerState {
  timers: Record<number, TimerEntry>;
  activeId: number | null;
}

interface TimerContextValue {
  start: (leetcodeId: number) => void;
  pause: (leetcodeId: number) => void;
  stop: (leetcodeId: number) => number;
  reset: (leetcodeId: number) => void;
  getElapsedMs: (leetcodeId: number) => number;
  seed: (leetcodeId: number, seconds: number) => void;
  activeId: number | null;
  tick: number;
}

const TimerContext = createContext<TimerContextValue | null>(null);

function loadState(): TimerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timers: {}, activeId: null };

    const parsed = JSON.parse(raw) as TimerState;
    const timers = { ...parsed.timers };

    for (const key of Object.keys(timers)) {
      const entry = timers[Number(key)];
      if (entry.lastStartedAt !== null) {
        entry.accumulatedMs += Date.now() - entry.lastStartedAt;
        entry.lastStartedAt = null;
      }
    }

    return { timers, activeId: null };
  } catch {
    return { timers: {}, activeId: null };
  }
}

function saveState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures.
  }
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>(loadState);
  const [tick, setTick] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state.activeId === null) return;
    const intervalId = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(intervalId);
  }, [state.activeId]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const handleBeforeUnload = () => saveState(stateRef.current);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const getElapsedMs = useCallback((leetcodeId: number) => {
    const entry = stateRef.current.timers[leetcodeId];
    if (!entry) return 0;
    if (entry.lastStartedAt !== null) {
      return entry.accumulatedMs + (Date.now() - entry.lastStartedAt);
    }
    return entry.accumulatedMs;
  }, []);

  const start = useCallback((leetcodeId: number) => {
    setState((prev) => {
      const timers = { ...prev.timers };

      if (prev.activeId !== null && prev.activeId !== leetcodeId) {
        const activeEntry = timers[prev.activeId];
        if (activeEntry && activeEntry.lastStartedAt !== null) {
          timers[prev.activeId] = {
            accumulatedMs: activeEntry.accumulatedMs + (Date.now() - activeEntry.lastStartedAt),
            lastStartedAt: null,
          };
        }
      }

      const currentEntry = timers[leetcodeId];
      timers[leetcodeId] = {
        accumulatedMs: currentEntry?.accumulatedMs ?? 0,
        lastStartedAt: Date.now(),
      };

      return { timers, activeId: leetcodeId };
    });
  }, []);

  const pause = useCallback((leetcodeId: number) => {
    setState((prev) => {
      const entry = prev.timers[leetcodeId];
      if (!entry || entry.lastStartedAt === null) return prev;

      const timers = { ...prev.timers };
      timers[leetcodeId] = {
        accumulatedMs: entry.accumulatedMs + (Date.now() - entry.lastStartedAt),
        lastStartedAt: null,
      };

      return {
        timers,
        activeId: prev.activeId === leetcodeId ? null : prev.activeId,
      };
    });
  }, []);

  const stop = useCallback((leetcodeId: number) => {
    const entry = stateRef.current.timers[leetcodeId];
    let elapsedMs = 0;

    if (entry) {
      elapsedMs = entry.accumulatedMs;
      if (entry.lastStartedAt !== null) {
        elapsedMs += Date.now() - entry.lastStartedAt;
      }
    }

    setState((prev) => {
      const timers = { ...prev.timers };
      timers[leetcodeId] = {
        accumulatedMs: elapsedMs,
        lastStartedAt: null,
      };
      return {
        timers,
        activeId: prev.activeId === leetcodeId ? null : prev.activeId,
      };
    });

    return Math.round(elapsedMs / 1000);
  }, []);

  const reset = useCallback((leetcodeId: number) => {
    setState((prev) => {
      const timers = { ...prev.timers };
      delete timers[leetcodeId];
      return {
        timers,
        activeId: prev.activeId === leetcodeId ? null : prev.activeId,
      };
    });
  }, []);

  const seed = useCallback((leetcodeId: number, seconds: number) => {
    setState((prev) => {
      if (prev.timers[leetcodeId] || seconds <= 0) return prev;

      return {
        ...prev,
        timers: {
          ...prev.timers,
          [leetcodeId]: {
            accumulatedMs: seconds * 1000,
            lastStartedAt: null,
          },
        },
      };
    });
  }, []);

  return (
    <TimerContext.Provider value={{ start, pause, stop, reset, getElapsedMs, seed, activeId: state.activeId, tick }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
}

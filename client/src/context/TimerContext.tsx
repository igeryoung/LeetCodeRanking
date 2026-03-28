import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'lc-timer-state';

interface TimerEntry {
  accumulatedMs: number;
  lastStartedAt: number | null; // timestamp when last resumed, null if paused
}

interface TimerState {
  timers: Record<number, TimerEntry>;
  activeId: number | null;
}

interface TimerContextValue {
  /** Start or resume a timer for a problem. Auto-pauses any other active timer. */
  start: (leetcodeId: number) => void;
  /** Pause the timer for a problem. */
  pause: (leetcodeId: number) => void;
  /** Stop and finalize the timer, returning elapsed seconds. */
  stop: (leetcodeId: number) => number;
  /** Reset timer for a problem back to 0. */
  reset: (leetcodeId: number) => void;
  /** Get current elapsed milliseconds for a problem. */
  getElapsedMs: (leetcodeId: number) => number;
  /** Seed a timer with server-persisted time (only if no local state exists). */
  seed: (leetcodeId: number, seconds: number) => void;
  /** The currently active (running) problem id, or null. */
  activeId: number | null;
  /** Current tick counter — changes every second to trigger re-renders. */
  tick: number;
}

const TimerContext = createContext<TimerContextValue | null>(null);

function loadState(): TimerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timers: {}, activeId: null };
    const parsed = JSON.parse(raw) as TimerState;

    // Freeze any timer that was running when the window closed
    const timers = { ...parsed.timers };
    for (const key of Object.keys(timers)) {
      const entry = timers[Number(key)];
      if (entry.lastStartedAt !== null) {
        // Accumulate time up to when the page was closed, then pause
        entry.accumulatedMs += Date.now() - entry.lastStartedAt;
        entry.lastStartedAt = null;
      }
    }
    return { timers, activeId: null }; // always restore as paused
  } catch {
    return { timers: {}, activeId: null };
  }
}

function saveState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full — silently ignore
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(loadState);
  const [tick, setTick] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Tick every second while there's an active timer
  useEffect(() => {
    if (state.activeId === null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [state.activeId]);

  // Persist to localStorage on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Save on beforeunload
  useEffect(() => {
    const handler = () => saveState(stateRef.current);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const getElapsedMs = useCallback((leetcodeId: number): number => {
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

      // Pause the currently active timer if different
      if (prev.activeId !== null && prev.activeId !== leetcodeId) {
        const active = timers[prev.activeId];
        if (active && active.lastStartedAt !== null) {
          timers[prev.activeId] = {
            accumulatedMs: active.accumulatedMs + (Date.now() - active.lastStartedAt),
            lastStartedAt: null,
          };
        }
      }

      // Start/resume the requested timer
      const existing = timers[leetcodeId];
      timers[leetcodeId] = {
        accumulatedMs: existing?.accumulatedMs ?? 0,
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

  const stop = useCallback((leetcodeId: number): number => {
    const entry = stateRef.current.timers[leetcodeId];
    let elapsed = 0;
    if (entry) {
      elapsed = entry.accumulatedMs;
      if (entry.lastStartedAt !== null) {
        elapsed += Date.now() - entry.lastStartedAt;
      }
    }

    setState((prev) => {
      const timers = { ...prev.timers };
      // Keep the entry with final time but mark as stopped
      timers[leetcodeId] = { accumulatedMs: elapsed, lastStartedAt: null };
      return {
        timers,
        activeId: prev.activeId === leetcodeId ? null : prev.activeId,
      };
    });

    return Math.round(elapsed / 1000);
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
      // Don't overwrite existing local timer state
      if (prev.timers[leetcodeId]) return prev;
      if (seconds <= 0) return prev;
      const timers = { ...prev.timers };
      timers[leetcodeId] = { accumulatedMs: seconds * 1000, lastStartedAt: null };
      return { ...prev, timers };
    });
  }, []);

  return (
    <TimerContext.Provider value={{ start, pause, stop, reset, getElapsedMs, seed, activeId: state.activeId, tick }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}

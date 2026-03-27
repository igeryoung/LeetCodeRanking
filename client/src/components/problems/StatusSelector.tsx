import { useState, useRef, useEffect } from 'react';
import { Check, Minus, Bookmark, X, ChevronDown } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { ProblemStatus } from '../../types';

const OPTIONS = [
  { value: 'solved',    label: 'Solved',    Icon: Check,    color: 'text-green-600 dark:text-green-400' },
  { value: 'attempted', label: 'Attempted', Icon: Minus,    color: 'text-amber-600 dark:text-amber-400' },
  { value: 'todo',      label: 'Todo',      Icon: Bookmark, color: 'text-blue-600 dark:text-blue-400'   },
] as const;

interface Props {
  current?: ProblemStatus;
  onSelect: (status: string, notes: string) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function StatusSelector({ current, onSelect, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handle = async (value: string) => {
    setLoading(true);
    setOpen(false);
    try {
      await onSelect(value, current?.notes ?? '');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onRemove();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-1 cursor-pointer disabled:opacity-50"
        aria-label="Set problem status"
      >
        {current ? (
          <StatusBadge status={current.status} compact />
        ) : (
          <span className="flex items-center gap-0.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <ChevronDown size={13} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50">
          {OPTIONS.map(({ value, label, Icon, color }) => (
            <button
              key={value}
              onClick={() => handle(value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${color} ${current?.status === value ? 'font-semibold' : ''}`}
            >
              <Icon size={14} />
              {label}
              {current?.status === value && <Check size={12} className="ml-auto" />}
            </button>
          ))}
          {current && (
            <>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
              <button
                onClick={handleRemove}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
              >
                <X size={14} />
                Remove
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

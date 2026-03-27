import { useState, useRef, useEffect } from 'react';
import { Check, Minus, Bookmark, X, ChevronDown } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import type { ProblemStatus } from '../../types';

const OPTIONS = [
  { value: 'solved'    as const, Icon: Check,    color: 'text-green-600 dark:text-green-400' },
  { value: 'attempted' as const, Icon: Minus,    color: 'text-amber-600 dark:text-amber-400' },
  { value: 'todo'      as const, Icon: Bookmark, color: 'text-blue-600 dark:text-blue-400'   },
];

interface Props {
  current?: ProblemStatus;
  onSelect: (status: string, notes: string) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function StatusSelector({ current, onSelect, onRemove }: Props) {
  const { t } = useLanguage();
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
          {OPTIONS.map(({ value, Icon, color }) => (
            <button
              key={value}
              onClick={() => handle(value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${color} ${current?.status === value ? 'font-semibold' : ''}`}
            >
              <Icon size={14} />
              {t.status[value]}
              {current?.status === value && <Check size={12} className="ml-auto" />}
            </button>
          ))}
          <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
          <button
            onClick={handleRemove}
            disabled={!current}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <X size={14} />
            {t.status.remove}
          </button>
        </div>
      )}
    </div>
  );
}

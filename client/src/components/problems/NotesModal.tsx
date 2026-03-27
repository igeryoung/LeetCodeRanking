import { useState, useEffect } from 'react';
import { X, StickyNote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Problem, ProblemStatus } from '../../types';

interface Props {
  problem: Problem;
  status: ProblemStatus;
  onSave: (notes: string) => Promise<void>;
  onClose: () => void;
}

export function NotesModal({ problem, status, onSave, onClose }: Props) {
  const { t, language } = useLanguage();
  const [notes, setNotes] = useState(status.notes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(notes);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <StickyNote size={16} className="text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              {t.notes.title} — #{problem.leetcode_id}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">
            {language === 'zh-TW' && problem.title_zh ? problem.title_zh : problem.title}
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notes.placeholder}
            rows={6}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {t.notes.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
          >
            {saving ? '…' : t.notes.save}
          </button>
        </div>
      </div>
    </div>
  );
}

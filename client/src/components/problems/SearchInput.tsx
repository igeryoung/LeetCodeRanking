import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search by title, ID…' }: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (v: string) => {
    setLocal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 350);
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      {local && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
